use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DueCard {
    pub id: i64,
    pub content_type: String,
    pub content_id: i64,
    pub state: String,
    pub stability: f64,
    pub difficulty: f64,
    pub elapsed_days: u32,
    pub scheduled_days: u32,
    pub reps: u32,
    pub lapses: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCardRequest {
    pub content_type: String,
    pub content_id: i64,
}

/// Get cards that are due for review
/// Note: Actual DB query is done via the SQL plugin from the frontend.
/// These commands provide computed values and business logic.
#[tauri::command]
pub fn get_due_cards(limit: Option<u32>) -> Result<Vec<DueCard>, String> {
    let _limit = limit.unwrap_or(20);
    // The actual database query is handled by the SQL plugin on the frontend.
    // This command serves as a placeholder for future Rust-side query optimization.
    Ok(vec![])
}

/// Create a new SRS card
#[tauri::command]
pub fn create_card(content_type: String, content_id: i64) -> Result<CreateCardRequest, String> {
    Ok(CreateCardRequest {
        content_type,
        content_id,
    })
}
