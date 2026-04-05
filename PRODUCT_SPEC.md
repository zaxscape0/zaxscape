# ZaxScape — Product Specification
## Personal Financial Command Center & Local Market Intelligence Platform

---

## 1. Product Vision (One-Pager)

ZaxScape is a private-use financial command center that combines macro market intelligence with hyper-local deal flow. It gives one operator a single pane of glass to monitor public markets, local mortgage rates, businesses for sale, and investment real estate — with built-in analysis tools to evaluate every opportunity.

**Core thesis:** The edge isn't in having Bloomberg-grade market data (everyone has that). The edge is in combining macro awareness with local intelligence that institutional tools don't cover — local lender rates, small business acquisitions, and neighborhood-level real estate deals — all in one fast, dense, keyboard-friendly interface.

**Not a SaaS. Not a startup. A personal weapon.**

---

## 2. Feature Map

### Module Overview

| Module | Purpose | Priority |
|--------|---------|----------|
| Dashboard | Daily command center — what changed, what matters | P0 |
| Markets | Stocks, ETFs, bonds, rates, sectors, macro | P0 |
| Portfolio | Track holdings, dividends, performance | P1 |
| Rates | Local mortgage/lending rate tracker | P0 |
| Lenders | Directory of local banks/CUs with products | P1 |
| Businesses for Sale | Aggregated acquisition pipeline | P0 |
| Real Estate | Investment property listings + analysis | P0 |
| Deal Analyzer | Unified calculator for RE + business deals | P0 |
| Map View | Geographic exploration of opportunities | P1 |
| Alerts | Price drops, rate changes, new listings, thresholds | P1 |
| Saved Opportunities | Watchlist for deals across all modules | P1 |
| Notes / Research Journal | Attach thoughts to any asset or listing | P2 |
| Settings / Data Sources | Configure geography, sources, preferences | P1 |

### Dashboard Features
- Market snapshot (indexes, yields, VIX, sectors, commodities)
- Rate snapshot (best local rates by product)
- Opportunity feed (newest businesses + properties in target geo)
- Watchlist movers (biggest changes in saved tickers)
- Alerts feed (price drops, rate changes, new listings)
- Quick actions (analyze deal, save listing, add note)

### Markets Features
- Major index cards (S&P, Nasdaq, Dow, Russell, VIX)
- Custom watchlist with real-time/delayed quotes
- Stock/ETF detail: price, chart, fundamentals, dividends, valuation
- Economic calendar (FOMC, CPI, jobs, GDP)
- Yield curve visualization
- Sector heat map
- Credit spreads tracker
- Commodity prices
- News/catalyst panel (per ticker or market-wide)

### Rates Features
- Local lender directory with products
- Rate tracking: 30yr, 15yr, ARM, jumbo, HELOC, investor, commercial
- Filters: loan type, occupancy, loan size, conforming/jumbo
- Comparison table across lenders
- "Best current offer" highlight
- Historical trend chart per lender/product
- Manual quote entry override
- Source URL + last updated timestamp

### Businesses for Sale Features
- Aggregated listing table from multiple sources
- Fields: asking price, revenue, SDE/cash flow, EBITDA, industry, city, broker, listing age, source
- Buy-box scoring (recurring revenue, semi-absentee, stable margins, reasonable multiples)
- Staleness/overpriced/incomplete flags
- Industry + geography filters
- Broker details + contact
- Reason for sale when available
- Quick deal analysis from listing

### Real Estate Features
- Investment listing table (multifamily, mixed-use, retail, office, industrial)
- Fields: price, estimated NOI, cap rate, units, sqft, taxes, rent roll, occupancy
- Reported vs estimated value labels
- Price/unit and price/sqft comparisons
- Map view with pins
- Mortgage modeling per listing
- Rent estimate inputs
- Comparable context when available

### Deal Analyzer Features
- **Real Estate inputs:** purchase price, down payment, rate, amort, closing costs, reno budget, vacancy, repairs, management, taxes, insurance, HOA, other income, exit cap
- **Real Estate outputs:** cap rate, GRM, DSCR, monthly payment, cash flow after debt, cash-on-cash, break-even occupancy, sensitivity table
- **Business inputs:** purchase price, SBA/conventional debt, down payment, rate, seller financing, revenue stability, owner salary replacement, cleanup costs, working capital
- **Business outputs:** simple payback, DSCR, acquisition multiple, salary replacement analysis, debt service schedule
- Manual entry or paste listing URL
- Edit assumptions inline
- Compare multiple financing scenarios
- Save + export analysis

---

## 3. Recommended System Architecture

### Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | Next.js 14 (App Router) + Tailwind + shadcn/ui | Fast, SSR-capable, great tables (TanStack Table), dark mode built-in |
| **Backend** | Next.js API routes + tRPC or plain REST | Keeps it simple, one codebase, serverless on Vercel |
| **Database** | Supabase (Postgres) | Already have it, excellent for structured data, real-time subscriptions, row-level security |
| **Data Ingestion** | Vercel Cron + Edge Functions for scraping, plus manual CSV/entry | Lightweight, no separate infra |
| **Market Data API** | Alpha Vantage (free tier) → upgrade to Polygon.io or Twelve Data | Start free, upgrade when needed |
| **Maps** | Mapbox GL JS or Leaflet | Free tier generous, great for pins + zones |
| **Search** | Supabase full-text search → pg_trgm | No need for Elasticsearch at personal scale |
| **Auth** | Supabase Auth (single user, password) | Simple, already integrated |
| **Hosting** | Vercel | Already set up, auto-deploy from GitHub |
| **Alerts** | Supabase edge functions + Resend email or Telegram bot | You already have both configured |

### Architecture Diagram (Simplified)

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│     Next.js + Tailwind + shadcn/ui          │
│     TanStack Table / Recharts / Mapbox      │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│              API LAYER                       │
│     Next.js API Routes / Server Actions      │
│     Calculation Engine (server-side)         │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│              SUPABASE                        │
│     Postgres: listings, rates, watchlists    │
│     Auth: single user                        │
│     Edge Functions: scrapers, alerts         │
│     Storage: exports, attachments            │
└──────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│          EXTERNAL DATA SOURCES               │
│     Alpha Vantage / Polygon (markets)        │
│     Lender websites (scraped rates)          │
│     BizBuySell / BizQuest (businesses)       │
│     Realtor / LoopNet / Crexi (real estate)  │
│     FRED API (macro/rates)                   │
│     Manual CSV / paste / entry               │
└──────────────────────────────────────────────┘
```

---

## 4. Database Schema (Core Tables)

```sql
-- MARKET DATA
CREATE TABLE watchlist_items (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT,
  asset_type TEXT, -- stock, etf, bond, crypto, commodity
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  target_price NUMERIC,
  alert_enabled BOOLEAN DEFAULT FALSE
);

CREATE TABLE market_snapshots (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  price NUMERIC,
  change_pct NUMERIC,
  volume BIGINT,
  market_cap NUMERIC,
  pe_ratio NUMERIC,
  dividend_yield NUMERIC,
  week_52_high NUMERIC,
  week_52_low NUMERIC,
  data_source TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- PORTFOLIO
CREATE TABLE portfolio_holdings (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  shares NUMERIC NOT NULL,
  avg_cost NUMERIC,
  account_name TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- RATES
CREATE TABLE lenders (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT, -- bank, credit_union, mortgage_co, online
  city TEXT,
  state TEXT,
  zip TEXT,
  website TEXT,
  phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE rate_entries (
  id SERIAL PRIMARY KEY,
  lender_id INT REFERENCES lenders(id),
  product_type TEXT NOT NULL, -- 30yr_fixed, 15yr_fixed, arm_5_1, jumbo, heloc, investor, commercial
  occupancy_type TEXT, -- owner, investor, second_home
  rate NUMERIC NOT NULL,
  apr NUMERIC,
  points NUMERIC,
  fees TEXT,
  min_loan NUMERIC,
  max_loan NUMERIC,
  source_url TEXT,
  data_origin TEXT, -- scraped, manual, quoted
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUSINESSES FOR SALE
CREATE TABLE business_listings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  asking_price NUMERIC,
  revenue NUMERIC,
  sde_cash_flow NUMERIC,
  ebitda NUMERIC,
  industry TEXT,
  sub_industry TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  county TEXT,
  broker_name TEXT,
  broker_company TEXT,
  broker_phone TEXT,
  broker_email TEXT,
  reason_for_sale TEXT,
  description TEXT,
  employees INT,
  year_established INT,
  is_franchise BOOLEAN,
  is_semi_absentee BOOLEAN,
  has_recurring_revenue BOOLEAN,
  source_platform TEXT, -- bizbuysell, bizquest, loopnet, manual
  source_url TEXT,
  source_listing_id TEXT,
  data_origin TEXT, -- scraped, manual
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  listing_age_days INT,
  is_active BOOLEAN DEFAULT TRUE,
  -- calculated
  asking_multiple NUMERIC, -- asking_price / sde
  score NUMERIC, -- buy-box score
  flags JSONB, -- {stale: true, overpriced: true, incomplete: true}
  notes TEXT
);

-- REAL ESTATE
CREATE TABLE re_listings (
  id SERIAL PRIMARY KEY,
  title TEXT,
  property_type TEXT, -- multifamily, mixed_use, retail, office, industrial, land
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  county TEXT,
  asking_price NUMERIC,
  units INT,
  sqft NUMERIC,
  lot_size NUMERIC,
  year_built INT,
  occupancy_pct NUMERIC,
  reported_noi NUMERIC,
  estimated_noi NUMERIC,
  reported_cap_rate NUMERIC,
  estimated_cap_rate NUMERIC,
  gross_rent NUMERIC,
  taxes NUMERIC,
  insurance NUMERIC,
  hoa NUMERIC,
  price_per_unit NUMERIC,
  price_per_sqft NUMERIC,
  broker_name TEXT,
  broker_company TEXT,
  broker_phone TEXT,
  source_platform TEXT, -- realtor, loopnet, crexi, zillow, manual
  source_url TEXT,
  source_listing_id TEXT,
  data_origin TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  rent_roll JSONB, -- [{unit, rent, occupied, lease_end}]
  photos JSONB -- [url, ...]
);

-- DEAL ANALYSIS
CREATE TABLE deal_scenarios (
  id SERIAL PRIMARY KEY,
  deal_type TEXT NOT NULL, -- real_estate, business
  linked_listing_id INT, -- nullable, can be manual
  linked_listing_type TEXT, -- re_listings or business_listings
  name TEXT NOT NULL,
  assumptions JSONB NOT NULL, -- all inputs as key-value
  results JSONB, -- all calculated outputs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- ALERTS
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  alert_type TEXT, -- new_listing, price_drop, rate_change, threshold, watchlist
  module TEXT, -- markets, rates, businesses, real_estate
  condition JSONB, -- {field: "cap_rate", operator: ">=", value: 8}
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alert_events (
  id SERIAL PRIMARY KEY,
  alert_id INT REFERENCES alerts(id),
  message TEXT,
  data JSONB,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- SAVED OPPORTUNITIES
CREATE TABLE saved_items (
  id SERIAL PRIMARY KEY,
  item_type TEXT, -- business, property, ticker, lender
  item_id INT,
  label TEXT,
  notes TEXT,
  tags JSONB,
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTES / RESEARCH
CREATE TABLE research_notes (
  id SERIAL PRIMARY KEY,
  title TEXT,
  body TEXT,
  linked_type TEXT, -- business, property, ticker, lender, general
  linked_id INT,
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GEOGRAPHY
CREATE TABLE target_zones (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  zone_type TEXT, -- city, zip, county, radius
  center_lat NUMERIC,
  center_lng NUMERIC,
  radius_miles NUMERIC,
  city TEXT,
  state TEXT,
  zip TEXT,
  county TEXT,
  is_primary BOOLEAN DEFAULT FALSE
);
```

---

## 5. Data Sources by Module

| Module | Source | Type | Cost | Reliability |
|--------|--------|------|------|-------------|
| **Markets** | Alpha Vantage | API | Free (25/day) → $50/mo | Good |
| **Markets** | Polygon.io | API | Free (5/min delay) → $29/mo | Excellent |
| **Markets** | FRED (Federal Reserve) | API | Free | Excellent |
| **Markets** | Yahoo Finance (unofficial) | Scrape | Free | Moderate |
| **Rates** | Local lender websites | Scrape | Free | Manual maintenance |
| **Rates** | Bankrate / NerdWallet | Scrape | Free | Good |
| **Rates** | FRED (30yr mortgage avg) | API | Free | Excellent |
| **Rates** | Manual entry (broker quotes) | Manual | Free | Best |
| **Businesses** | BizBuySell | Scrape | Free | Good |
| **Businesses** | BizQuest | Scrape | Free | Good |
| **Businesses** | BusinessBroker.net | Scrape | Free | Moderate |
| **Businesses** | Manual / broker emails | Manual | Free | Best |
| **Real Estate** | LoopNet | Scrape | Free (limited) | Moderate |
| **Real Estate** | Crexi | API inquiry | Possibly free | Good |
| **Real Estate** | Realtor.com | Scrape | Free | Moderate |
| **Real Estate** | Zillow (ZTRAX limited) | Scrape | Free | Moderate |
| **Real Estate** | Manual / MLS feeds | Manual | Free | Best |
| **Maps** | Mapbox | API | Free (50k loads/mo) | Excellent |
| **Geocoding** | Mapbox / Census | API | Free tier | Good |

**Fallback for everything:** Manual entry, CSV upload, paste URL + parse.

---

## 6. Calculation Framework

### Real Estate Calculations

```
Cap Rate = NOI / Purchase Price
GRM = Purchase Price / Annual Gross Rent
NOI = Gross Rent - Vacancy - Operating Expenses
DSCR = NOI / Annual Debt Service
Monthly Payment = standard amortization formula
Annual Debt Service = Monthly Payment × 12
Cash Flow After Debt = NOI - Annual Debt Service
Cash-on-Cash = Cash Flow After Debt / Total Cash Invested
Total Cash Invested = Down Payment + Closing Costs + Reno Budget
Break-even Occupancy = (Operating Expenses + Debt Service) / Gross Potential Rent
Price Per Unit = Purchase Price / Units
Price Per SqFt = Purchase Price / SqFt
```

**Sensitivity analysis:** Vary rate (±1%), vacancy (±5%), rent (±10%), exit cap (±1%) and show impact on cash-on-cash and IRR.

### Business Acquisition Calculations

```
Asking Multiple = Asking Price / SDE (or EBITDA)
Simple Payback = Asking Price / Annual Cash Flow
DSCR = SDE / Annual Debt Service
Owner Benefit = SDE - Owner Replacement Salary
Net to Buyer = Owner Benefit - Debt Service
ROI = Net to Buyer / Down Payment
```

**SBA assumptions default:** 10% down, SBA 7(a) rate (Prime + 2.75%), 10yr amort, ~3% SBA guarantee fee.

---

## 7. Phased MVP Roadmap

### Phase 1 — Foundation (Weeks 1–2)
- [ ] Project scaffold: Next.js + Tailwind + shadcn/ui + Supabase
- [ ] Auth (single user login)
- [ ] Sidebar navigation + command bar (⌘K)
- [ ] Dark/light mode
- [ ] Database schema deployed
- [ ] Dashboard skeleton

### Phase 2 — Core Modules (Weeks 3–5)
- [ ] Markets module: watchlist, index cards, stock detail (Alpha Vantage)
- [ ] Rates module: lender directory, rate entry (manual first), comparison table
- [ ] Businesses module: listing table, filters, manual entry + BizBuySell scraper
- [ ] Real Estate module: listing table, filters, manual entry
- [ ] Deal Analyzer: RE calculator + business calculator

### Phase 3 — Data Pipeline (Weeks 6–7)
- [ ] Cron jobs for market data refresh
- [ ] Rate scraping from 5–10 local lenders
- [ ] Business listing ingestion (BizBuySell)
- [ ] RE listing ingestion (LoopNet/Crexi)
- [ ] FRED macro data integration

### Phase 4 — Power Features (Weeks 8–10)
- [ ] Alert system (new listings, rate changes, price drops)
- [ ] Map view with Mapbox
- [ ] Saved opportunities across modules
- [ ] Notes/research journal
- [ ] CSV import/export
- [ ] Keyboard shortcuts
- [ ] Scoring models (business buy-box, RE deal quality)
- [ ] Sensitivity analysis tables

---

## 8. Open Questions for You

1. **Geography:** What's your home area? City/zip/radius so I can configure target zones and start identifying local lenders.

2. **Lenders:** Do you have a list of local banks/credit unions you already track, or should I research them?

3. **Portfolio:** Do you have existing holdings you want to import? Brokerage CSV or manual list?

4. **Business buy-box:** What's your ideal acquisition? Revenue range, SDE range, industries you like/avoid, max asking price, max multiple you'd pay?

5. **RE criteria:** What property types interest you most? Multifamily? Mixed-use? What unit count or price range?

6. **Market data tier:** Start with free Alpha Vantage (25 calls/day, delayed) or pay for Polygon ($29/mo real-time)?

7. **Existing Supabase:** Use the existing ZaxScape Supabase (wxkyrurufyvwrshfcpjj) with new tables, or create a fresh project?

8. **Domain:** Keep app.zaxscape.com or new domain?

9. **Mobile:** Desktop-first is assumed. Do you need mobile-responsive or strictly desktop?

10. **Timeline pressure:** Is this a "build it right over weeks" project or "get something usable ASAP"?

---

## 9. UI Wireframe Plan

### Dashboard
```
┌──────────┬────────────────────────────────────────────┐
│          │  ⌘K Search                        [alerts] │
│  SIDEBAR │──────────────────────────────────────────── │
│          │ MARKET SNAPSHOT    │ RATE SNAPSHOT          │
│ Dashboard│ SPY +0.4%  QQQ.. │ Best 30yr: 6.25% (FCU) │
│ Markets  │ 10Y: 4.2%  VIX.. │ Best 15yr: 5.75% (PNC) │
│ Portfolio│ Gold  Oil  BTC    │ Jumbo: 6.50% (Chase)   │
│ Rates    │────────────────────────────────────────────│
│ Lenders  │ OPPORTUNITY FEED          │ WATCHLIST MOVES│
│ Business │ 🏢 4-unit MF $320K 8.2%  │ AAPL +2.3%    │
│ Real Est │ 🏪 Laundromat $185K 2.8x │ MSFT -0.5%    │
│ Deals    │ 🏠 6-unit MF $480K 7.5%  │ O +1.1%       │
│ Map      │────────────────────────────────────────────│
│ Alerts   │ ALERTS                                     │
│ Saved    │ ⚡ New listing: Auto shop $250K in Erie    │
│ Notes    │ ⚡ Rate drop: First Fed 30yr now 6.125%    │
│ Settings │ ⚡ Price cut: 8-unit MF reduced to $550K   │
└──────────┴────────────────────────────────────────────┘
```

### Markets
- Top: Index cards row (S&P, Nasdaq, Dow, Russell, VIX, 10Y, BTC)
- Left: Watchlist table (sortable, filterable)
- Right: Selected ticker detail (chart, fundamentals, dividends)
- Bottom: Economic calendar + sector heatmap

### Rates
- Top: "Best rates" highlight cards by product
- Main: Sortable comparison table (lender × product × rate)
- Right panel: Trend chart for selected lender/product
- Filter bar: loan type, occupancy, loan size

### Businesses for Sale
- Full-width filterable table
- Columns: title, price, SDE, multiple, industry, city, score, listing age, source
- Row click → detail panel with full info + quick analyze button
- Color coding: green (good deal), yellow (investigate), red (overpriced/stale)

### Real Estate
- Similar table layout to businesses
- Columns: address, price, type, units, cap rate, NOI, price/unit, city
- Map toggle
- Row click → detail + quick analyze

### Deal Analyzer
- Two-column layout
- Left: Input assumptions (editable form)
- Right: Live-updating results (metrics + charts)
- Bottom: Scenario comparison table
- Toggle between RE and Business mode

---

## 10. What to Build First vs Later

### Build First (MVP Core)
1. **Scaffold + navigation + auth** — the shell
2. **Dashboard** — even if sparse, it's the home base
3. **Deal Analyzer** — highest immediate value, no data dependencies
4. **Rates module (manual entry)** — start logging quotes immediately
5. **Business listings (manual + basic scraper)** — start building pipeline
6. **Markets watchlist** — connect Alpha Vantage, show what matters

### Build Later
- RE listings ingestion (complex scraping)
- Map view (nice but not blocking)
- Alerts (needs data flowing first)
- Portfolio tracking (lower priority than deal flow)
- Scoring models (need data to calibrate)
- Notes system (can use external tools meanwhile)
- CSV export (nice to have)

---

*Document generated 2026-04-05. Ready for review.*
