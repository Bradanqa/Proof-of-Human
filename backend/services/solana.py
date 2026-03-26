from solana.rpc.api import Client
from solana.transaction import Transaction
from solana.rpc.commitment import Confirmed
from anchorpy import Program, Provider, Wallet
from pathlib import Path
import time
import base64
from config import settings


class SolanaService:
    def __init__(self):
        self.rpc_url = settings.solana_rpc_url
        self.client = Client(self.rpc_url)
        self.program_id = settings.program_id
        self.wallet_path = Path(settings.solana_wallet_keypair_path).expanduser()
        self.authority_keypair = None
        
        self._load_wallet()
    
    def _load_wallet(self):
        if self.wallet_path.exists():
            try:
                from solders.keypair import Keypair
                with open(self.wallet_path, "r") as f:
                    keypair_data = f.read()
                self.authority_keypair = Keypair.from_base58_string(keypair_data)
            except Exception:
                self.authority_keypair = None
    
    def sign_verification(self, wallet_address: str, score: int, timestamp: int) -> bytes:
        message = f"{wallet_address}:{score}:{timestamp}".encode("utf-8")
        
        if self.authority_keypair:
            from solders.signature import Signature
            signature = self.authority_keypair.sign_message(message)
            return bytes(signature)
        else:
            return b"mock_signature_for_development"
    
    def submit_verification(
        self,
        wallet_address: str,
        score: int,
        timestamp: int,
        signature: bytes
    ) -> str:
        try:
            from solders.pubkey import Pubkey
            from solders.instruction import Instruction, AccountMeta
            from solders.system_program import ID
            
            user_pubkey = Pubkey.from_string(wallet_address)
            program_pubkey = Pubkey.from_string(self.program_id)
            
            state_pda = self._derive_pda(b"state", program_pubkey)
            user_account_pda = self._derive_pda(
                b"human",
                user_pubkey,
                program_pubkey
            )
            
            instruction_data = self._encode_verify_instruction(
                score,
                timestamp,
                signature
            )
            
            accounts = [
                AccountMeta(pubkey=user_account_pda, is_signer=False, is_writable=True),
                AccountMeta(pubkey=self.authority_keypair.pubkey(), is_signer=True, is_writable=True),
                AccountMeta(pubkey=user_pubkey, is_signer=False, is_writable=False),
                AccountMeta(pubkey=ID, is_signer=False, is_writable=False),
            ]
            
            instruction = Instruction(
                program_id=program_pubkey,
                accounts=accounts,
                data=instruction_data
            )
            
            transaction = Transaction()
            transaction.add(instruction)
            
            if self.authority_keypair:
                tx_signature = self.client.send_transaction(
                    transaction,
                    self.authority_keypair,
                    opts={"commitment": Confirmed}
                )
                
                return str(tx_signature)
            
            return "mock_transaction_signature"
        
        except Exception as e:
            raise Exception(f"Solana transaction failed: {str(e)}")
    
    def get_human_status(self, wallet_address: str) -> dict:
        try:
            from solders.pubkey import Pubkey
            
            user_pubkey = Pubkey.from_string(wallet_address)
            program_pubkey = Pubkey.from_string(self.program_id)
            
            user_account_pda = self._derive_pda(
                b"human",
                user_pubkey,
                program_pubkey
            )
            
            account_info = self.client.get_account_info(user_account_pda)
            
            if account_info.value is None:
                return {
                    "is_verified": False,
                    "score": 0,
                    "last_verified": 0,
                    "verification_count": 0
                }
            
            account_data = account_info.value.data
            
            is_verified = account_data[32 + 1] == 1
            score = account_data[32 + 1 + 1]
            last_verified = int.from_bytes(account_data[32 + 1 + 1 + 1:32 + 1 + 1 + 1 + 8], "little")
            verification_count = int.from_bytes(account_data[32 + 1 + 1 + 1 + 8:32 + 1 + 1 + 1 + 8 + 4], "little")
            
            return {
                "is_verified": is_verified,
                "score": score,
                "last_verified": last_verified,
                "verification_count": verification_count
            }
        
        except Exception:
            return {
                "is_verified": False,
                "score": 0,
                "last_verified": 0,
                "verification_count": 0
            }
    
    def _derive_pda(self, seed: bytes, pubkey=None, program_id=None) -> 'Pubkey':
        from solders.pubkey import Pubkey
        
        if program_id is None:
            program_id = Pubkey.from_string(self.program_id)
        
        if pubkey:
            seeds = [seed, bytes(pubkey)]
        else:
            seeds = [seed]
        
        pda, bump = Pubkey.find_program_address(seeds, program_id)
        return pda
    
    def _encode_verify_instruction(self, score: int, timestamp: int, signature: bytes) -> bytes:
        discriminator = bytes([0x79, 0x0a, 0x2c, 0x0e, 0x0c, 0x2c, 0x2e, 0x2e])
        
        score_bytes = bytes([score])
        timestamp_bytes = timestamp.to_bytes(8, "little")
        signature_length = len(signature).to_bytes(4, "little")
        
        return discriminator + score_bytes + timestamp_bytes + signature_length + signature
    
    def initialize_program(self, admin_address: str) -> str:
        try:
            from solders.pubkey import Pubkey
            from solders.instruction import Instruction, AccountMeta
            from solders.system_program import ID
            
            admin_pubkey = Pubkey.from_string(admin_address)
            program_pubkey = Pubkey.from_string(self.program_id)
            
            state_pda = self._derive_pda(b"state", program_pubkey)
            
            instruction_data = self._encode_initialize_instruction(admin_pubkey)
            
            accounts = [
                AccountMeta(pubkey=state_pda, is_signer=False, is_writable=True),
                AccountMeta(pubkey=admin_pubkey, is_signer=True, is_writable=True),
                AccountMeta(pubkey=ID, is_signer=False, is_writable=False),
            ]
            
            instruction = Instruction(
                program_id=program_pubkey,
                accounts=accounts,
                data=instruction_data
            )
            
            transaction = Transaction()
            transaction.add(instruction)
            
            if self.authority_keypair:
                tx_signature = self.client.send_transaction(
                    transaction,
                    self.authority_keypair,
                    opts={"commitment": Confirmed}
                )
                
                return str(tx_signature)
            
            return "mock_initialization_signature"
        
        except Exception as e:
            raise Exception(f"Initialization failed: {str(e)}")
    
    def _encode_initialize_instruction(self, admin_pubkey: 'Pubkey') -> bytes:
        discriminator = bytes([0x57, 0xab, 0x75, 0x1a, 0x2f, 0x8c, 0x0e, 0x2a])
        return discriminator + bytes(admin_pubkey)