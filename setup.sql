-- ZaxScape v2 Database Schema
-- All tables prefixed with zs_ to avoid conflicts with existing tables
-- Run this in Supabase SQL Editor

-- ============================================================
-- MARKET DATA
-- ============================================================

CREATE TABLE IF NOT EXISTS zs_watchlist_items (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT,
  asset_type TEXT, -- stock, etf, bond, crypto, commodity
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  target_price NUMERIC,
  alert_enabled BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS zs_market_snapshots (
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

CREATE INDEX IF NOT EXISTS idx_zs_market_snapshots_symbol ON zs_market_snapshots(symbol);
CREATE INDEX IF NOT EXISTS idx_zs_market_snapshots_fetched ON zs_market_snapshots(fetched_at DESC);

-- ============================================================
-- PORTFOLIO
-- ============================================================

CREATE TABLE IF NOT EXISTS zs_portfolio_holdings (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  shares NUMERIC NOT NULL,
  avg_cost NUMERIC,
  account_name TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RATES
-- ============================================================

CREATE TABLE IF NOT EXISTS zs_lenders (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT, -- bank, credit_union, mortgage_co, online
  city TEXT,
  state TEXT,
  zip TEXT,
  website TEXT,
  phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zs_rate_entries (
  id SERIAL PRIMARY KEY,
  lender_id INT REFERENCES zs_lenders(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_zs_rate_entries_lender ON zs_rate_entries(lender_id);
CREATE INDEX IF NOT EXISTS idx_zs_rate_entries_product ON zs_rate_entries(product_type);
CREATE INDEX IF NOT EXISTS idx_zs_rate_entries_captured ON zs_rate_entries(captured_at DESC);

-- ============================================================
-- BUSINESSES FOR SALE
-- ============================================================

CREATE TABLE IF NOT EXISTS zs_business_listings (
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
  asking_multiple NUMERIC, -- asking_price / sde
  score NUMERIC, -- buy-box score
  flags JSONB DEFAULT '{}', -- {stale: true, overpriced: true, incomplete: true}
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_zs_biz_city ON zs_business_listings(city, state);
CREATE INDEX IF NOT EXISTS idx_zs_biz_industry ON zs_business_listings(industry);
CREATE INDEX IF NOT EXISTS idx_zs_biz_active ON zs_business_listings(is_active);

-- ============================================================
-- REAL ESTATE
-- ============================================================

CREATE TABLE IF NOT EXISTS zs_re_listings (
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

CREATE INDEX IF NOT EXISTS idx_zs_re_city ON zs_re_listings(city, state);
CREATE INDEX IF NOT EXISTS idx_zs_re_type ON zs_re_listings(property_type);
CREATE INDEX IF NOT EXISTS idx_zs_re_active ON zs_re_listings(is_active);

-- ============================================================
-- DEAL ANALYSIS
-- ============================================================

CREATE TABLE IF NOT EXISTS zs_deal_scenarios (
  id SERIAL PRIMARY KEY,
  deal_type TEXT NOT NULL, -- real_estate, business
  linked_listing_id INT,
  linked_listing_type TEXT, -- zs_re_listings or zs_business_listings
  name TEXT NOT NULL,
  assumptions JSONB NOT NULL,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- ============================================================
-- ALERTS
-- ============================================================

CREATE TABLE IF NOT EXISTS zs_alerts (
  id SERIAL PRIMARY KEY,
  alert_type TEXT, -- new_listing, price_drop, rate_change, threshold, watchlist
  module TEXT, -- markets, rates, businesses, real_estate
  condition JSONB, -- {field: "cap_rate", operator: ">=", value: 8}
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zs_alert_events (
  id SERIAL PRIMARY KEY,
  alert_id INT REFERENCES zs_alerts(id) ON DELETE CASCADE,
  message TEXT,
  data JSONB,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_zs_alert_events_alert ON zs_alert_events(alert_id);
CREATE INDEX IF NOT EXISTS idx_zs_alert_events_unread ON zs_alert_events(read) WHERE read = FALSE;

-- ============================================================
-- SAVED OPPORTUNITIES
-- ============================================================

CREATE TABLE IF NOT EXISTS zs_saved_items (
  id SERIAL PRIMARY KEY,
  item_type TEXT, -- business, property, ticker, lender
  item_id INT,
  label TEXT,
  notes TEXT,
  tags JSONB,
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTES / RESEARCH
-- ============================================================

CREATE TABLE IF NOT EXISTS zs_research_notes (
  id SERIAL PRIMARY KEY,
  title TEXT,
  body TEXT,
  linked_type TEXT, -- business, property, ticker, lender, general
  linked_id INT,
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GEOGRAPHY
-- ============================================================

CREATE TABLE IF NOT EXISTS zs_target_zones (
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

-- ============================================================
-- SEED: Default target zone (Boston, MA — 100 mile radius)
-- ============================================================

INSERT INTO zs_target_zones (name, zone_type, center_lat, center_lng, radius_miles, city, state, is_primary)
VALUES ('Boston Metro', 'radius', 42.3601, -71.0589, 100, 'Boston', 'MA', TRUE)
ON CONFLICT DO NOTHING;
