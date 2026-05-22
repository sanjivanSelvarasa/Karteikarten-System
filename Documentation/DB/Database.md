# Datenbanktabellen Karteikarten-System

## Tabelle: users

| Feldname | Datentyp |
|---|---|
| user_id | INTEGER |
| username | VARCHAR(50) |
| email | VARCHAR(255) |
| password_hash | VARCHAR(255) |
| created_at | DATETIME |
| updated_at | DATETIME |

**Beziehungen:**

- Ein Benutzer kann mehrere Lernsets besitzen.
- Ein Benutzer kann zu mehreren Karteikarten Lernfortschritte haben.
- Ein Benutzer kann mehrere Lernversuche speichern.
- Ein Benutzer besitzt eine Statistik.
- Ein Benutzer kann mehrere Refresh Tokens besitzen.

---

## Tabelle: learning_sets

| Feldname | Datentyp |
|---|---|
| set_id | INTEGER |
| user_id | INTEGER |
| title | VARCHAR(100) |
| description | TEXT |
| is_public | BOOLEAN |
| created_at | DATETIME |
| updated_at | DATETIME |

**Beziehungen:**

- Ein Lernset gehört zu genau einem Benutzer.
- Ein Lernset kann mehrere Karteikarten enthalten.

---

## Tabelle: flashcards

| Feldname | Datentyp |
|---|---|
| flashcard_id | INTEGER |
| set_id | INTEGER |
| question | TEXT |
| answer | TEXT |
| position | INTEGER |
| created_at | DATETIME |
| updated_at | DATETIME |

**Beziehungen:**

- Eine Karteikarte gehört zu genau einem Lernset.
- Eine Karteikarte kann von mehreren Benutzern gelernt werden.
- Eine Karteikarte kann mehrere Lernversuche besitzen.

---

## Tabelle: user_flashcard_progress

| Feldname | Datentyp |
|---|---|
| progress_id | INTEGER |
| user_id | INTEGER |
| flashcard_id | INTEGER |
| correct_count | INTEGER |
| wrong_count | INTEGER |
| difficulty | INTEGER |
| last_reviewed_at | DATETIME |
| next_review_at | DATETIME |
| created_at | DATETIME |
| updated_at | DATETIME |

**Beziehungen:**

- Ein Lernfortschritt gehört zu genau einem Benutzer.
- Ein Lernfortschritt gehört zu genau einer Karteikarte.
- Diese Tabelle verbindet Benutzer und Karteikarten.

---

## Tabelle: review_logs

| Feldname | Datentyp |
|---|---|
| review_id | INTEGER |
| user_id | INTEGER |
| flashcard_id | INTEGER |
| is_correct | BOOLEAN |
| reviewed_at | DATETIME |

**Beziehungen:**

- Ein Lernversuch gehört zu genau einem Benutzer.
- Ein Lernversuch gehört zu genau einer Karteikarte.
- Ein Benutzer kann mehrere Lernversuche speichern.
- Eine Karteikarte kann in mehreren Lernversuchen vorkommen.

---

## Tabelle: user_stats

| Feldname | Datentyp |
|---|---|
| stats_id | INTEGER |
| user_id | INTEGER |
| xp | INTEGER |
| streak_days | INTEGER |
| last_study_date | DATE |

**Beziehungen:**

- Eine Statistik gehört zu genau einem Benutzer.
- Ein Benutzer besitzt genau eine Statistik.

---

## Tabelle: refresh_tokens

| Feldname | Datentyp |
|---|---|
| refresh_token_id | INTEGER |
| user_id | INTEGER |
| token_hash | VARCHAR(255) |
| expires_at | DATETIME |
| revoked_at | DATETIME |
| created_at | DATETIME |

**Beziehungen:**

- Ein Refresh Token gehört zu genau einem Benutzer.
- Ein Benutzer kann mehrere Refresh Tokens besitzen.
- Refresh Tokens werden für dauerhafte Sitzungen oder erneutes Anfordern von Access Tokens verwendet.