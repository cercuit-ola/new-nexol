import { useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, Plus } from "lucide-react";
import { formatUnits, isAddress, keccak256, parseEventLogs, parseUnits, toBytes, type Address } from "viem";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { erc20Abi, schedulerAbi } from "@/lib/contracts";
import { configuredTokens, explorerUrl, schedulerAddress, targetChain, tokenConfig, type TokenSymbol } from "@/lib/web3";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const initialForm = { name: "", recipient: "", total: "", count: "4", intervalDays: "7", token: "USDC" as TokenSymbol, startDate: "" };
const statusNames = ["Unknown", "Active", "Completed", "Cancelled"];

export default function PaymentScheduler() {
  const { address, chainId, isConnected } = useAccount();
  const { user } = useAuth();
  const client = usePublicClient({ chainId: targetChain.id });
  const { writeContractAsync } = useWriteContract();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const ready = Boolean(address && schedulerAddress && chainId === targetChain.id);
  const idsQuery = useReadContract({ address: schedulerAddress, abi: schedulerAbi, functionName: "getUserScheduleIds", args: address ? [address] : undefined, chainId: targetChain.id, query: { enabled: ready } });
  const ids = (idsQuery.data || []) as readonly bigint[];
  type ScheduleValue = readonly [Address,Address,Address,bigint,bigint,bigint,number,number,number,number,`0x${string}`];
  const [rows,setRows]=useState<{id:bigint;value:ScheduleValue;due:boolean}[]>([]);
  useEffect(()=>{let active=true;if(!client||!schedulerAddress||!ready){setRows([]);return;}const load=()=>Promise.all(ids.map(async id=>({id,value:await client.readContract({address:schedulerAddress,abi:schedulerAbi,functionName:"schedules",args:[id]}) as ScheduleValue,due:Boolean(await client.readContract({address:schedulerAddress,abi:schedulerAbi,functionName:"releasable",args:[id]}))}))).then(data=>{if(active)setRows(data)}).catch(error=>toast.error("Could not read schedules",{description:error.message}));load();const timer=setInterval(load,15000);return()=>{active=false;clearInterval(timer)}},[client,ready,idsQuery.data]);

  async function confirm(hash:`0x${string}`, message:string) {
    if (!client) throw new Error("Base RPC client unavailable");
    toast.info("Transaction submitted", { description: "Waiting for confirmation…" });
    const receipt = await client.waitForTransactionReceipt({hash});
    if (receipt.status !== "success") throw new Error("Transaction reverted");
    toast.success(message,{action:{label:"View",onClick:()=>window.open(`${explorerUrl}/tx/${hash}`,"_blank")}});
    await idsQuery.refetch(); return receipt;
  }

  async function create(event:React.FormEvent) {
    event.preventDefault();
    if (!address || !schedulerAddress || !client) return toast.error("Connect a wallet and configure the scheduler contract.");
    if (!isAddress(form.recipient) || form.recipient.toLowerCase() === address.toLowerCase()) return toast.error("Enter a different, valid recipient wallet.");
    const token = tokenConfig[form.token]; if (!token.address) return toast.error(`${form.token} is not configured.`);
    try {
      setBusy("create");
      const amount = parseUnits(form.total, token.decimals);
      const allowance = await client.readContract({address:token.address,abi:erc20Abi,functionName:"allowance",args:[address,schedulerAddress]});
      if (allowance < amount) { const approval = await writeContractAsync({address:token.address,abi:erc20Abi,functionName:"approve",args:[schedulerAddress,amount],chainId:targetChain.id} as never); await confirm(approval,`${form.token} spending approved`); }
      const metadata = JSON.stringify({name:form.name.trim()}); const metadataHash=keccak256(toBytes(metadata));
      const start = BigInt(Math.floor(new Date(`${form.startDate}T09:00:00`).getTime()/1000));
      const hash=await writeContractAsync({address:schedulerAddress,abi:schedulerAbi,functionName:"createSchedule",args:[form.recipient as Address,token.address,amount,start,Number(form.intervalDays)*86400,Number(form.count),metadataHash],chainId:targetChain.id} as never);
      const receipt=await confirm(hash,"Funded payment schedule created"); localStorage.setItem(`nexol:schedule:${metadataHash}`,metadata);
      const eventLog=parseEventLogs({abi:schedulerAbi,eventName:"ScheduleCreated",logs:receipt.logs})[0];
      if(user&&user.id!=="demo-user") await supabase.from("payment_schedules").insert({user_id:user.id,name:form.name.trim(),recipient_email:null,total_amount:Number(form.total),installment_amount:Number(form.total)/Number(form.count),installment_count:Number(form.count),interval_days:Number(form.intervalDays),token:form.token,starts_at:new Date(Number(start)*1000).toISOString(),next_release_at:new Date(Number(start)*1000).toISOString(),released_count:0,status:"active",payer_wallet:address,recipient_wallet:form.recipient.toLowerCase(),chain_id:targetChain.id,contract_address:schedulerAddress,contract_schedule_id:Number(eventLog?.args.scheduleId),metadata_hash:metadataHash,creation_tx_hash:hash} as never);
      setForm(initialForm);setOpen(false);
    } catch(error){toast.error("Schedule transaction failed",{description:error instanceof Error?error.message:"Wallet or network failure"});} finally{setBusy(null);}
  }

  async function action(id:bigint, fn:"executePayment"|"cancelSchedule") {
    if(!schedulerAddress)return;
    try{setBusy(`${fn}-${id}`);const hash=await writeContractAsync({address:schedulerAddress,abi:schedulerAbi,functionName:fn,args:[id],chainId:targetChain.id} as never);await confirm(hash,fn==="executePayment"?"Installment released":"Schedule cancelled and remainder refunded");}
    catch(error){toast.error("Transaction failed",{description:error instanceof Error?error.message:"Unknown error"});}finally{setBusy(null);}
  }

  return <div className="space-y-7">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">On-chain payment scheduler</p><h1 className="mt-2 font-display text-3xl font-bold">Scheduled payouts</h1><p className="mt-1 text-sm text-muted-foreground">Pre-fund recurring transfers; Chainlink Automation or any keeper can release each due installment.</p></div><Button onClick={()=>setOpen(true)} disabled={!ready} className="gap-2"><Plus size={16}/> New schedule</Button></div>
    {!isConnected&&<Notice>Connect your wallet above to view schedules.</Notice>}{isConnected&&chainId!==targetChain.id&&<Notice>Switch your wallet to {targetChain.name}.</Notice>}{!schedulerAddress&&<Notice>The scheduler contract is not deployed/configured. Set NEXT_PUBLIC_SCHEDULER_CONTRACT_ADDRESS after deployment.</Notice>}
    <div className="rounded-2xl border border-border bg-card overflow-hidden"><div className="border-b border-border p-5"><h2 className="font-display text-xl font-semibold">Blockchain schedules</h2></div>{ready&&idsQuery.isLoading?<Empty text="Reading Base…"/>:rows.length===0?<Empty text={ready?"No funded schedules found for this wallet.":"Connect to the configured network to load schedules."}/>:<div className="divide-y divide-border">{rows.map(({id,value,due})=>{const [payer,recipient,tokenAddress,total,installment,start,interval,count,released,status,metadataHash]=value!;const token=configuredTokens.find(([,c])=>c.address?.toLowerCase()===tokenAddress.toLowerCase());const metadata=typeof window!=="undefined"?localStorage.getItem(`nexol:schedule:${metadataHash}`):null;const name=metadata?JSON.parse(metadata).name:`Schedule #${id}`;const isPayer=payer.toLowerCase()===address?.toLowerCase();const progress=Number(released)/Number(count)*100;return <div key={id.toString()} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{name}</h3><p className="mt-1 text-xs text-muted-foreground">To {recipient.slice(0,8)}…{recipient.slice(-4)} · every {Math.round(Number(interval)/86400)} day(s)</p></div><div className="text-right"><p className="font-display text-xl font-bold">{formatUnits(installment,token?.[1].decimals||6)} {token?.[0]||"TOKEN"}</p><p className="text-xs text-primary">{statusNames[status]}</p></div></div><div className="mt-4 h-1.5 rounded-full bg-accent"><div className="h-full rounded-full bg-primary" style={{width:`${progress}%`}}/></div><div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>{released} of {count} released · {formatUnits(total,token?.[1].decimals||6)} total</span><span>Started {new Date(Number(start)*1000).toLocaleDateString()}</span></div><div className="mt-4 flex flex-wrap gap-2">{status===1&&<Button size="sm" disabled={!due||!!busy} onClick={()=>action(id,"executePayment")}>{due?"Release due payment":"Not due yet"}</Button>}{isPayer&&status===1&&<Button size="sm" variant="destructive" disabled={!!busy} onClick={()=>action(id,"cancelSchedule")}>Cancel & refund remainder</Button>}<a href={`${explorerUrl}/address/${schedulerAddress}`} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost">View contract</Button></a></div></div>})}</div>}</div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Create funded schedule</DialogTitle><DialogDescription>The full amount is deposited now, so future installments cannot fail from insufficient allowance.</DialogDescription></DialogHeader><form onSubmit={create} className="space-y-4"><Field label="Schedule name"><Input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label="Recipient wallet"><Input required placeholder="0x…" value={form.recipient} onChange={e=>setForm({...form,recipient:e.target.value})}/></Field><div className="grid grid-cols-2 gap-3"><Field label="Total"><Input required type="number" min="0.000001" step="0.000001" value={form.total} onChange={e=>setForm({...form,total:e.target.value})}/></Field><Field label="Token"><select className="h-10 w-full rounded-md border border-input bg-background px-3" value={form.token} onChange={e=>setForm({...form,token:e.target.value as TokenSymbol})}>{configuredTokens.map(([symbol])=><option key={symbol}>{symbol}</option>)}</select></Field></div><div className="grid grid-cols-2 gap-3"><Field label="Payments"><Input required type="number" min="1" max="1000" value={form.count} onChange={e=>setForm({...form,count:e.target.value})}/></Field><Field label="Interval days"><Input required type="number" min="1" value={form.intervalDays} onChange={e=>setForm({...form,intervalDays:e.target.value})}/></Field></div><Field label="First payment date"><Input required type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></Field><Button className="w-full" disabled={!!busy}>{busy?"Confirm in wallet…":"Approve token & fund schedule"}</Button></form></DialogContent></Dialog>
  </div>;
}
function Notice({children}:{children:React.ReactNode}){return <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100/80"><AlertTriangle size={17} className="shrink-0 text-amber-300"/>{children}</div>}
function Empty({text}:{text:string}){return <div className="p-12 text-center"><CalendarClock size={38} className="mx-auto mb-3 text-primary"/><p className="text-sm text-muted-foreground">{text}</p></div>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <div className="space-y-2"><Label>{label}</Label>{children}</div>}
