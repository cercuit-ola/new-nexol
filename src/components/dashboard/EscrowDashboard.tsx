import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, Plus, ShieldCheck } from "lucide-react";
import { formatUnits, isAddress, keccak256, parseEventLogs, parseUnits, toBytes, type Address } from "viem";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { erc20Abi, escrowAbi } from "@/lib/contracts";
import { configuredTokens, escrowAddress, explorerUrl, targetChain, tokenConfig, type TokenSymbol } from "@/lib/web3";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const statuses = ["Unknown", "Funded", "Work submitted", "Released", "Refunded", "Disputed", "Resolved"];
const initialForm = { title: "", payee: "", description: "", amount: "", token: "USDC" as TokenSymbol, deadline: "" };

export default function EscrowDashboard() {
  const { address, chainId, isConnected } = useAccount();
  const { user } = useAuth();
  const client = usePublicClient({ chainId: targetChain.id });
  const { writeContractAsync } = useWriteContract();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const ready = Boolean(address && escrowAddress && chainId === targetChain.id);
  const idsQuery = useReadContract({ address: escrowAddress, abi: escrowAbi, functionName: "getUserEscrowIds", args: address ? [address] : undefined, chainId: targetChain.id, query: { enabled: ready } });
  const ids = (idsQuery.data || []) as readonly bigint[];
  type EscrowValue = readonly [Address, Address, Address, bigint, bigint, number, `0x${string}`];
  const [rows, setRows] = useState<{id:bigint;value:EscrowValue}[]>([]);
  useEffect(() => {
    let active = true;
    if (!client || !escrowAddress || !ready) { setRows([]); return; }
    Promise.all(ids.map(async id => ({ id, value: await client.readContract({address:escrowAddress,abi:escrowAbi,functionName:"escrows",args:[id]}) as EscrowValue }))).then(data => { if(active)setRows(data); }).catch(error=>toast.error("Could not read escrow records",{description:error.message}));
    return () => { active=false; };
  }, [client, ready, idsQuery.data]);

  async function confirm(hash: `0x${string}`, message: string) {
    if (!client) throw new Error("Base RPC client is unavailable");
    toast.info("Transaction submitted", { description: "Waiting for network confirmation…" });
    const receipt = await client.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") throw new Error("Transaction reverted");
    toast.success(message, { action: { label: "View", onClick: () => window.open(`${explorerUrl}/tx/${hash}`, "_blank") } });
    await idsQuery.refetch(); return receipt;
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (!address || !escrowAddress || !client) return toast.error("Connect a wallet and configure the escrow contract first.");
    if (!isAddress(form.payee) || form.payee.toLowerCase() === address.toLowerCase()) return toast.error("Enter a different, valid recipient wallet address.");
    const token = tokenConfig[form.token];
    if (!token.address) return toast.error(`${form.token} is not configured on ${targetChain.name}.`);
    try {
      setBusy("create");
      const amount = parseUnits(form.amount, token.decimals);
      const allowance = await client.readContract({ address: token.address, abi: erc20Abi, functionName: "allowance", args: [address, escrowAddress] });
      if (allowance < amount) {
        const approval = await writeContractAsync({ address: token.address, abi: erc20Abi, functionName: "approve", args: [escrowAddress, amount], chainId: targetChain.id } as never);
        await confirm(approval, `${form.token} spending approved`);
      }
      const metadata = JSON.stringify({ title: form.title.trim(), description: form.description.trim() });
      const metadataHash = keccak256(toBytes(metadata));
      const deadline = form.deadline ? BigInt(Math.floor(new Date(`${form.deadline}T23:59:59`).getTime() / 1000)) : BigInt(0);
      const hash = await writeContractAsync({ address: escrowAddress, abi: escrowAbi, functionName: "createEscrow", args: [form.payee as Address, token.address, amount, deadline, metadataHash], chainId: targetChain.id } as never);
      const receipt = await confirm(hash, "Escrow funded on-chain");
      localStorage.setItem(`nexol:escrow:${metadataHash}`, metadata);
      const eventLog = parseEventLogs({abi:escrowAbi,eventName:"EscrowFunded",logs:receipt.logs})[0];
      if (user && user.id !== "demo-user" && user.email) await supabase.from("escrows").insert({creator_id:user.id,creator_email:user.email,counterparty_email:`${form.payee.toLowerCase()}@wallet.local`,title:form.title.trim(),description:form.description.trim(),amount:Number(form.amount),token:form.token,network:targetChain.id===8453?"base":"base-sepolia",deadline:form.deadline?new Date(`${form.deadline}T23:59:59`).toISOString():null,status:"funded",funding_tx_hash:hash,payer_wallet:address,payee_wallet:form.payee.toLowerCase(),chain_id:targetChain.id,contract_address:escrowAddress,contract_escrow_id:Number(eventLog?.args.escrowId),metadata_hash:metadataHash} as never);
      setForm(initialForm); setOpen(false);
    } catch (error) { toast.error("Escrow transaction failed", { description: error instanceof Error ? error.message : "Wallet rejected or RPC failed" }); }
    finally { setBusy(null); }
  }

  async function action(id: bigint, fn: "submitWork" | "release" | "refund" | "raiseDispute") {
    if (!escrowAddress) return;
    try {
      setBusy(`${fn}-${id}`);
      const args = fn === "submitWork" || fn === "raiseDispute" ? [id, keccak256(toBytes(`${fn}:${Date.now()}`))] : [id];
      const hash = await writeContractAsync({ address: escrowAddress, abi: escrowAbi, functionName: fn, args, chainId: targetChain.id } as never);
      await confirm(hash, fn === "release" ? "Funds released" : fn === "refund" ? "Refund confirmed" : fn === "submitWork" ? "Work submitted" : "Dispute opened");
    } catch (error) { toast.error("Transaction failed", { description: error instanceof Error ? error.message : "Unknown error" }); }
    finally { setBusy(null); }
  }

  return <div className="space-y-7">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">On-chain escrow</p><h1 className="mt-2 font-display text-3xl font-bold">Your agreements</h1><p className="mt-1 text-sm text-muted-foreground">Tokens are held by the contract until release, refund, or dispute resolution.</p></div><Button onClick={() => setOpen(true)} disabled={!ready} className="gap-2"><Plus size={16}/> New escrow</Button></div>
    {!isConnected && <Notice>Connect your wallet above to view and fund agreements.</Notice>}
    {isConnected && chainId !== targetChain.id && <Notice>Switch your wallet to {targetChain.name}.</Notice>}
    {!escrowAddress && <Notice>The escrow contract is not deployed/configured yet. Set NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS after deployment.</Notice>}
    <div className="rounded-2xl border border-border bg-card overflow-hidden"><div className="border-b border-border p-5"><h2 className="font-display text-xl font-semibold">Blockchain agreements</h2></div>
      {ready && idsQuery.isLoading ? <Empty text="Reading Base…"/> : rows.length === 0 ? <Empty text={ready ? "No funded escrows found for this wallet." : "Connect to the configured network to load escrows."}/> : <div className="divide-y divide-border">{rows.map(({ id, value }) => {
        const [payer, payee, tokenAddress, amount, deadline, status, metadataHash] = value!;
        const token = configuredTokens.find(([, config]) => config.address?.toLowerCase() === tokenAddress.toLowerCase());
        const metadata = typeof window !== "undefined" ? localStorage.getItem(`nexol:escrow:${metadataHash}`) : null;
        const title = metadata ? (JSON.parse(metadata).title || `Escrow #${id}`) : `Escrow #${id}`;
        const mine = address?.toLowerCase(); const isPayer = payer.toLowerCase() === mine; const isPayee = payee.toLowerCase() === mine;
        return <div key={id.toString()} className="p-5 space-y-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{isPayer ? `Payee ${payee.slice(0,8)}…${payee.slice(-4)}` : `Payer ${payer.slice(0,8)}…${payer.slice(-4)}`}</p></div><div className="text-right"><p className="font-display text-xl font-bold">{formatUnits(amount, token?.[1].decimals || 6)} {token?.[0] || "TOKEN"}</p><p className="text-xs text-primary">{statuses[status]}</p></div></div>
          {deadline > BigInt(0) && <p className="text-xs text-muted-foreground">Deadline: {new Date(Number(deadline) * 1000).toLocaleString()}</p>}
          <div className="flex flex-wrap gap-2">{isPayee && status === 1 && <Button size="sm" onClick={() => action(id,"submitWork")} disabled={!!busy}>Submit work</Button>}{isPayer && (status === 1 || status === 2) && <Button size="sm" onClick={() => action(id,"release")} disabled={!!busy}>Approve & release</Button>}{isPayee && (status === 1 || status === 2) && <Button size="sm" variant="outline" onClick={() => action(id,"refund")} disabled={!!busy}>Refund payer</Button>}{(isPayer || isPayee) && (status === 1 || status === 2) && <Button size="sm" variant="destructive" onClick={() => action(id,"raiseDispute")} disabled={!!busy}>Dispute</Button>}<a href={`${explorerUrl}/address/${escrowAddress}`} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost"><ExternalLink size={13} className="mr-1"/>Contract</Button></a></div>
        </div>})}</div>}
    </div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Fund an escrow</DialogTitle><DialogDescription>Approval and funding are real wallet transactions on {targetChain.name}.</DialogDescription></DialogHeader><form onSubmit={create} className="space-y-4"><Field label="Agreement title"><Input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></Field><Field label="Payee wallet"><Input required value={form.payee} onChange={e=>setForm({...form,payee:e.target.value})} placeholder="0x…"/></Field><Field label="Scope and acceptance criteria"><Textarea required minLength={10} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></Field><div className="grid grid-cols-2 gap-3"><Field label="Amount"><Input required type="number" min="0.000001" step="0.000001" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></Field><Field label="Token"><select className="h-10 w-full rounded-md border border-input bg-background px-3" value={form.token} onChange={e=>setForm({...form,token:e.target.value as TokenSymbol})}>{configuredTokens.map(([symbol])=><option key={symbol}>{symbol}</option>)}</select></Field></div><Field label="Deadline (optional)"><Input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/></Field><Button className="w-full" disabled={!!busy}>{busy ? "Confirm in wallet…" : "Approve token & fund escrow"}</Button></form></DialogContent></Dialog>
  </div>;
}

function Notice({children}:{children:React.ReactNode}) { return <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100/80"><AlertTriangle size={17} className="shrink-0 text-amber-300"/>{children}</div> }
function Empty({text}:{text:string}) { return <div className="p-12 text-center"><ShieldCheck size={38} className="mx-auto mb-3 text-primary"/><p className="text-sm text-muted-foreground">{text}</p></div> }
function Field({label,children}:{label:string;children:React.ReactNode}) { return <div className="space-y-2"><Label>{label}</Label>{children}</div> }
