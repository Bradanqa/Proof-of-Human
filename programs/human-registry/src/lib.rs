use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("HumaN1111111111111111111111111111111111111");

#[program]
pub mod human_registry {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, admin: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.admin = admin;
        state.authority = admin;
        state.bump = ctx.bumps.state;
        state.created_at = Clock::get()?.unix_timestamp;
        
        emit!(RegistryInitialized {
            admin,
            timestamp: state.created_at,
        });

        Ok(())
    }

    pub fn verify_human(
        ctx: Context<VerifyHuman>,
        score: u8,
        timestamp: i64,
        signature: Vec<u8>,
    ) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        
        require!(
            verify_backend_signature(&signature, &ctx.accounts.authority.key()),
            CustomError::InvalidSignature
        );

        require!(score >= 50, CustomError::ScoreTooLow);
        
        if user_account.last_verified > 0 {
            require!(
                timestamp - user_account.last_verified > 3600,
                CustomError::TooSoon
            );
        }

        user_account.owner = ctx.accounts.user.key();
        user_account.score = score;
        user_account.last_verified = timestamp;
        user_account.is_verified = true;
        user_account.verification_count = user_account.verification_count.saturating_add(1);

        emit!(HumanVerified {
            user: ctx.accounts.user.key(),
            score,
            timestamp,
            verification_count: user_account.verification_count,
        });

        Ok(())
    }

    pub fn revoke_verification(ctx: Context<RevokeVerification>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.is_verified = false;
        user_account.score = 0;

        emit!(VerificationRevoked {
            user: ctx.accounts.user.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn get_human_status(ctx: Context<GetHumanStatus>) -> Result<HumanStatus> {
        let user_account = &ctx.accounts.user_account;
        
        Ok(HumanStatus {
            is_verified: user_account.is_verified,
            score: user_account.score,
            last_verified: user_account.last_verified,
            verification_count: user_account.verification_count,
        })
    }

    pub fn update_authority(ctx: Context<UpdateAuthority>, new_authority: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        require!(
            ctx.accounts.admin.key() == state.admin,
            CustomError::Unauthorized
        );
        state.authority = new_authority;

        emit!(AuthorityUpdated {
            old_authority: state.authority,
            new_authority,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[account]
pub struct AppState {
    pub admin: Pubkey,
    pub authority: Pubkey,
    pub bump: u8,
    pub created_at: i64,
}

#[account]
pub struct HumanAccount {
    pub owner: Pubkey,
    pub score: u8,
    pub last_verified: i64,
    pub is_verified: bool,
    pub verification_count: u32,
    pub metadata_uri: String,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 1 + 8,
        seeds = [b"state"],
        bump
    )]
    pub state: Account<'info, AppState>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyHuman<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + 32 + 1 + 8 + 1 + 4 + 200,
        seeds = [b"human", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, HumanAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub user: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeVerification<'info> {
    #[account(
        mut,
        seeds = [b"human", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, HumanAccount>,
    pub authority: Signer<'info>,
    pub user: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct GetHumanStatus<'info> {
    #[account(
        seeds = [b"human", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, HumanAccount>,
    pub user: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    #[account(
        mut,
        seeds = [b"state"],
        bump
    )]
    pub state: Account<'info, AppState>,
    pub admin: Signer<'info>,
}

#[event]
pub struct RegistryInitialized {
    pub admin: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct HumanVerified {
    pub user: Pubkey,
    pub score: u8,
    pub timestamp: i64,
    pub verification_count: u32,
}

#[event]
pub struct VerificationRevoked {
    pub user: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AuthorityUpdated {
    pub old_authority: Pubkey,
    pub new_authority: Pubkey,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct HumanStatus {
    pub is_verified: bool,
    pub score: u8,
    pub last_verified: i64,
    pub verification_count: u32,
}

#[error_code]
pub enum CustomError {
    #[msg("Score too low to be considered human")]
    ScoreTooLow,
    #[msg("Verification attempted too soon")]
    TooSoon,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid backend signature")]
    InvalidSignature,
    #[msg("User already verified")]
    AlreadyVerified,
}

fn verify_backend_signature(signature: &[u8], authority: &Pubkey) -> bool {
    signature.len() > 0
}