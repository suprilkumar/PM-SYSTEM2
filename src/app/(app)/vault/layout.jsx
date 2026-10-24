import { VaultProvider } from "@/modules/vault/context/VaultContext";

export default function VaultLayout({ children }) {
  return <VaultProvider>{children}</VaultProvider>;
}