import { useAccount, useConnect, useDisconnect, useReadContract, useSwitchChain } from "wagmi";
import { formatUnits } from "viem";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { targetChain, tokenConfig } from "@/lib/web3";
import { erc20Abi } from "@/lib/contracts";

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const balance = useReadContract({ address: tokenConfig.USDC.address, abi: erc20Abi, functionName: "balanceOf", args: address ? [address] : undefined, chainId: targetChain.id, query: { enabled: Boolean(address && tokenConfig.USDC.address && chainId === targetChain.id) } });
  if (isConnected && chainId !== targetChain.id) return <Button size="sm" variant="destructive" disabled={switching} onClick={() => switchChain({ chainId: targetChain.id })}>Switch to {targetChain.name}</Button>;
  if (isConnected) return <div className="flex items-center gap-2"><span className="hidden text-xs text-muted-foreground lg:inline">{balance.data !== undefined ? `${Number(formatUnits(balance.data, 6)).toLocaleString(undefined,{maximumFractionDigits:2})} USDC` : "USDC —"}</span><Button size="sm" variant="outline" onClick={() => disconnect()} title="Disconnect wallet"><Wallet size={14} className="mr-2" />{address?.slice(0, 6)}…{address?.slice(-4)}</Button></div>;
  const available = connectors.filter((connector, index, all) => ["injected", "coinbaseWalletSDK"].includes(connector.id) && all.findIndex(item => item.id === connector.id) === index);
  return <div className="flex items-center gap-2">{available.map(connector=><Button key={connector.uid} size="sm" variant={connector.id === "injected" ? "default" : "outline"} disabled={isPending} onClick={() => connect({ connector, chainId: targetChain.id })}><Wallet size={14} className="mr-2" />{isPending ? "Connecting…" : connector.id === "coinbaseWalletSDK" ? "Coinbase" : "Connect wallet"}</Button>)}</div>;
}
