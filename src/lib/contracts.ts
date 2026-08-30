export const erc20Abi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const;

export const escrowAbi = [
  { type: "function", name: "getUserEscrowIds", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256[]" }] },
  { type: "function", name: "escrows", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [{ name: "payer", type: "address" }, { name: "payee", type: "address" }, { name: "token", type: "address" }, { name: "amount", type: "uint128" }, { name: "deadline", type: "uint64" }, { name: "status", type: "uint8" }, { name: "metadataHash", type: "bytes32" }] },
  { type: "function", name: "createEscrow", stateMutability: "nonpayable", inputs: [{ name: "payee", type: "address" }, { name: "token", type: "address" }, { name: "amount", type: "uint128" }, { name: "deadline", type: "uint64" }, { name: "metadataHash", type: "bytes32" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "submitWork", stateMutability: "nonpayable", inputs: [{ name: "escrowId", type: "uint256" }, { name: "evidenceHash", type: "bytes32" }], outputs: [] },
  { type: "function", name: "release", stateMutability: "nonpayable", inputs: [{ name: "escrowId", type: "uint256" }], outputs: [] },
  { type: "function", name: "refund", stateMutability: "nonpayable", inputs: [{ name: "escrowId", type: "uint256" }], outputs: [] },
  { type: "function", name: "raiseDispute", stateMutability: "nonpayable", inputs: [{ name: "escrowId", type: "uint256" }, { name: "reasonHash", type: "bytes32" }], outputs: [] },
  { type: "event", name: "EscrowFunded", inputs: [{ indexed: true, name: "escrowId", type: "uint256" }, { indexed: true, name: "payer", type: "address" }, { indexed: true, name: "payee", type: "address" }, { indexed: false, name: "token", type: "address" }, { indexed: false, name: "amount", type: "uint256" }, { indexed: false, name: "deadline", type: "uint64" }, { indexed: false, name: "metadataHash", type: "bytes32" }] },
] as const;

export const schedulerAbi = [
  { type: "function", name: "getUserScheduleIds", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256[]" }] },
  { type: "function", name: "schedules", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [{ name: "payer", type: "address" }, { name: "recipient", type: "address" }, { name: "token", type: "address" }, { name: "totalAmount", type: "uint128" }, { name: "installmentAmount", type: "uint128" }, { name: "startTime", type: "uint64" }, { name: "intervalSeconds", type: "uint32" }, { name: "installmentCount", type: "uint16" }, { name: "releasedCount", type: "uint16" }, { name: "status", type: "uint8" }, { name: "metadataHash", type: "bytes32" }] },
  { type: "function", name: "createSchedule", stateMutability: "nonpayable", inputs: [{ name: "recipient", type: "address" }, { name: "token", type: "address" }, { name: "totalAmount", type: "uint128" }, { name: "startTime", type: "uint64" }, { name: "intervalSeconds", type: "uint32" }, { name: "installmentCount", type: "uint16" }, { name: "metadataHash", type: "bytes32" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "nextReleaseTime", stateMutability: "view", inputs: [{ name: "scheduleId", type: "uint256" }], outputs: [{ type: "uint64" }] },
  { type: "function", name: "releasable", stateMutability: "view", inputs: [{ name: "scheduleId", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "executePayment", stateMutability: "nonpayable", inputs: [{ name: "scheduleId", type: "uint256" }], outputs: [] },
  { type: "function", name: "cancelSchedule", stateMutability: "nonpayable", inputs: [{ name: "scheduleId", type: "uint256" }], outputs: [] },
  { type: "event", name: "ScheduleCreated", inputs: [{ indexed: true, name: "scheduleId", type: "uint256" }, { indexed: true, name: "payer", type: "address" }, { indexed: true, name: "recipient", type: "address" }, { indexed: false, name: "token", type: "address" }, { indexed: false, name: "totalAmount", type: "uint256" }, { indexed: false, name: "installmentAmount", type: "uint256" }, { indexed: false, name: "startTime", type: "uint64" }, { indexed: false, name: "intervalSeconds", type: "uint32" }, { indexed: false, name: "installmentCount", type: "uint16" }, { indexed: false, name: "metadataHash", type: "bytes32" }] },
] as const;
