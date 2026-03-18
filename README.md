# Trailblaze Index
An artifact evaluation and stat recommendation tool for **Honkai: Star Rail** that simplifies the process of building characters by surfacing the right stats for any artifact set or character.

> **Disclaimer:** Trailblaze Index is not affiliated with, endorsed by, or associated with [HoYoverse](https://www.hoyoverse.com/en-us/) in any way. Character data and stat recommendations are sourced from [Prydwen Institute](https://www.prydwen.gg), an independently operated community resource. All game assets and related trademarks are property of their respective owners.

<a href="https://trailblaze-index.vercel.app/">
  <img width="1902" height="943" alt="image" src="https://github.com/user-attachments/assets/386ddec7-d56f-4d51-9c8c-0bc2c080f41a" />
</a>

## Overview
Due to the sheer number of artifact combinations and ever-expanding roster of characters, it can be difficult to determine which artifact sets are actually useful and which stats matter for a specific character and build. Trailblaze Index simplifies this by allowing users to search for a specific artifact set or character and instantly see what's recommended without needing to cross-reference numerous guides or spreadsheets.

The application covers 50+ artifact sets and 85+ characters, with data updated daily via and automated scraping pipeline pulling from [Prydwen Institute](https://www.prydwen.gg).

## System Overview
The system can be organized into three main layers:
1. **Data Pipeline** - Artifact stat recommendations for all 85+ characters are scraped daily from [Prydwen Institute](https://www.prydwen.gg) via a scheduled cron job. The scraped data is then upserted into Supabase, ensuring the database always reflects the latest community recommendations with little to no manual intervention. 
2. **Backend** - A PostgreSQL function (`fetch_statistics`) serves as the primary data access layer. It accepts an artifact set identifier and returns a structured JSON response grouping substat combinations by artifact slot alongside the characters that benefit from them, exposed to the frontend via Supabase's typed RPC client.
3. **Frontend** - A Next.JS app router application built with React and Tailwind CSS, featuring components for browsing and filtering artifact sets and characters. TanStack Query handles server state management, with fetches conditionally triggered only when relevant data is needed.

### `fetch_statistics` (PostgreSQL Function)
The core backend function that powers artifact lookups.

It accepts an artifact identifier and returns a structured JSON object grouping substat combinations by slot with associated character recommendations.

```
SELECT public.fetch_statistics(artifact_target := '<id>');
```

**Parameters:**
| Parameter | Type | Description |
| --- | --- | --- |
| `artifact_target` | `bigint` | The ID of the artifact set to look up |

**Response Shape:**
```json
{
    "Head": {
        "main": "CRIT DMG",
        "substats": [
            {
                "characters": [1001, 1003, 1005],
                "stats": [
                    "ATK%",
                    "CRIT Rate",
                    "SPD"
                ]
            }
        ]
    },
    "Hands": { ... },
    "Body": { ... },
    "Feet": { ... },
    "Planar_Sphere": { ... },
    "Link_Rope": { ... },
}
```

## Tech Stack
| Layer | Technology |
| --- | --- |
| Database | PostgreSQL |
| Framework | Next.JS (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |

## License
This project is licensed under the MIT License. For more information, see the LICENSE file.
