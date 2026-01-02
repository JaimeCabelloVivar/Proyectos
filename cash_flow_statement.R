# Cash Flow Statement Builder
# This script prepares a cash flow statement from transactional data.
# Supply a transaction file (CSV/Excel) with columns: date, description, category, amount.
# Categories should represent business events (e.g., revenue, rent, equipment purchase, loan repayment).

library(tidyverse)
library(lubridate)
library(readxl)

#' Read a transaction file (CSV or Excel) into a normalized tibble
#' @param path Path to a CSV or Excel file with at least the columns: date, description, category, amount
#' @return Tibble with parsed date and standardized column names
read_transactions <- function(path) {
  stopifnot(file.exists(path))

  ext <- tools::file_ext(path)
  raw <- switch(
    tolower(ext),
    csv = readr::read_csv(path, show_col_types = FALSE),
    xlsx = readxl::read_excel(path),
    stop("Unsupported file type: ", ext)
  )

  required_cols <- c("date", "description", "category", "amount")
  missing_cols <- setdiff(required_cols, tolower(names(raw)))
  if (length(missing_cols) > 0) {
    stop("Missing required columns: ", paste(missing_cols, collapse = ", "))
  }

  raw %>%
    rename_with(~ tolower(.x)) %>%
    transmute(
      date = as_date(date),
      description = as.character(description),
      category = as.character(category),
      amount = as.numeric(amount)
    )
}

#' Map raw transaction categories to cash flow statement sections
#' @param transactions Tibble of transactions
#' @param category_map Tibble with columns category and section (Operating/Investing/Financing)
#' @return Tibble with a section column added
apply_section_map <- function(transactions, category_map) {
  transactions %>%
    left_join(category_map, by = "category") %>%
    mutate(section = coalesce(section, "Unclassified"))
}

#' Build a cash flow statement by period
#' @param transactions Tibble of transactions with date, category, amount, and section
#' @param opening_cash Starting cash balance at the beginning of the first period
#' @param freq Period frequency: "year", "quarter", or "month"
#' @return List with a detailed cash flow table and the grand totals
build_cash_flow_statement <- function(transactions, opening_cash = 0, freq = c("year", "quarter", "month")) {
  freq <- match.arg(freq)

  period_fun <- switch(freq,
    year = ~ floor_date(.x, unit = "year"),
    quarter = ~ floor_date(.x, unit = "quarter"),
    month = ~ floor_date(.x, unit = "month")
  )

  statement <- transactions %>%
    mutate(period = period_fun(date)) %>%
    group_by(period, section) %>%
    summarise(cash_flow = sum(amount, na.rm = TRUE), .groups = "drop") %>%
    group_by(period) %>%
    arrange(period, factor(section, levels = c("Operating", "Investing", "Financing", "Unclassified"))) %>%
    summarise(
      Operating = sum(cash_flow[section == "Operating"], na.rm = TRUE),
      Investing = sum(cash_flow[section == "Investing"], na.rm = TRUE),
      Financing = sum(cash_flow[section == "Financing"], na.rm = TRUE),
      Unclassified = sum(cash_flow[section == "Unclassified"], na.rm = TRUE),
      Net_Cash_Flow = sum(cash_flow, na.rm = TRUE),
      .groups = "drop"
    ) %>%
    arrange(period) %>%
    mutate(
      Opening_Cash = opening_cash + c(0, head(cumsum(Net_Cash_Flow), -1)),
      Closing_Cash = Opening_Cash + Net_Cash_Flow
    )

  list(
    statement = statement,
    totals = statement %>% summarise(across(c(Operating, Investing, Financing, Unclassified, Net_Cash_Flow), sum))
  )
}

# Example usage -----------------------------------------------------------
# 1) Define a category map that aligns business activities with cash flow sections.
default_category_map <- tribble(
  ~category, ~section,
  "salary income", "Operating",
  "rent expense", "Operating",
  "inventory purchase", "Operating",
  "tax payment", "Operating",
  "equipment purchase", "Investing",
  "asset sale", "Investing",
  "loan received", "Financing",
  "loan repayment", "Financing",
  "dividend paid", "Financing"
)

# 2) Simulate a small transactional dataset.
sample_transactions <- tibble(
  date = as_date(c("2024-01-15", "2024-01-31", "2024-02-10", "2024-02-20", "2024-03-05", "2024-03-18")),
  description = c(
    "January payroll received",
    "Office rent",
    "Inventory purchase",
    "Loan proceeds",
    "Equipment purchase",
    "Dividend payment"
  ),
  category = c(
    "salary income",
    "rent expense",
    "inventory purchase",
    "loan received",
    "equipment purchase",
    "dividend paid"
  ),
  amount = c(7500, -1800, -2500, 5000, -4200, -1000)
)

# 3) Apply the category map and build a quarterly cash flow statement.
# mapped <- apply_section_map(sample_transactions, default_category_map)
# cash_flow <- build_cash_flow_statement(mapped, opening_cash = 2000, freq = "quarter")
# print(cash_flow$statement)
# print(cash_flow$totals)
