# CLAUDE.md - AI Assistant Guide for Credit Scoring Model Project

## Project Overview

This repository contains a **Credit Scoring Model** analysis project implemented in R, focused on mortgage loan default prediction. The project performs comprehensive data analysis and builds logistic regression models to predict loan defaults (good vs. bad clients) for housing loans ("VIV" - Vivienda).

**Author:** Jaime Cabello
**Created:** 2023-10-19
**Primary Language:** R (R Markdown)
**Domain:** Financial Risk Management / Credit Risk Analysis

## Repository Structure

```
/home/user/Proyectos/
├── .git/                          # Git version control
├── Credit Scoring Model.Rmd       # Main R Markdown analysis file
└── CLAUDE.md                      # This file (AI assistant guide)
```

### Key Files

- **Credit Scoring Model.Rmd** (12,300 bytes): Primary analysis file containing all data processing, exploratory analysis, modeling, and validation steps.

## Technology Stack

### Core Technologies
- **R Language**: Statistical computing and data analysis
- **R Markdown**: Literate programming document combining code and documentation

### Required R Libraries

```r
library(readxl)        # Reading Excel files
library(caret)         # Machine learning workflows and model training
library(glmnet)        # Regularized linear models (Lasso/Ridge)
library(pROC)          # ROC curve analysis and AUC calculation
library(tidyverse)     # Data manipulation (dplyr, ggplot2, etc.)
library(gmodels)       # CrossTable for contingency tables
library(graphics)      # Base R graphics
library(openxlsx)      # Excel file operations
```

## Project Architecture

### Data Pipeline

1. **Data Import** (`Credit Scoring Model.Rmd:18-21`)
   - Reads from Excel file: `Base_scoring_modificada_final.xlsx`
   - Original path: `C:\Users\Jaime\OneDrive\Desktop\Ecotec\Posgrado\Gestion de Riesgo de Credito\...`

2. **Data Filtering** (`Credit Scoring Model.Rmd:28-33`)
   - Filters by `Tipo.Scoring == "VIV"` (mortgage/housing loans)
   - Target variable: `Dictamen` (0 = good client, 1 = bad client)

3. **Exploratory Data Analysis** (`Credit Scoring Model.Rmd:35-83`)
   - Extensive use of `CrossTable()` for categorical variable analysis
   - Histograms and boxplots for continuous variables
   - Outlier detection and visualization

4. **Data Cleaning** (`Credit Scoring Model.Rmd:122-181`)
   - Outlier removal (e.g., income > 100,000)
   - Missing value handling for 34+ variables
   - Variable elimination for high missingness

5. **Modeling** (`Credit Scoring Model.Rmd:185-202`)
   - Logistic regression with binomial family
   - 70/30 train-test split
   - Cross-validation ready

6. **Evaluation** (`Credit Scoring Model.Rmd:205-215`)
   - ROC curve analysis
   - AUC (Area Under Curve) metric
   - Model performance assessment

### Key Variables

#### Target Variable
- **Dictamen**: Binary outcome (0 = good client, 1 = bad client)

#### Predictor Categories

**Financial Variables:**
- `Ingresos.Mensuales`: Monthly income
- `Monto.Solicitado`: Requested loan amount
- `Monto.Otorgado`: Granted loan amount
- `Gastos.Aplicados`: Applied expenses
- `Activo.Total`: Total assets
- `Apalancamiento.Personal`: Personal leverage ratio
- `Deuda.Total.Sistema`: Total system debt
- `Capacidad.de.Pago.*`: Payment capacity metrics

**Demographic Variables:**
- `Sexo`: Gender
- `Edad`: Age (referenced as `age` in model)
- `Estado.Civil`: Marital status
- `Nivel.de.Estudios`: Education level
- `Profesion`: Profession
- `Nacionalidad`: Nationality

**Credit History:**
- `Calificacion.*`: Various credit ratings (historical and current)
- `fico_score`: FICO score
- `credit_history`: Credit history length

**Employment:**
- `Situacion.Laboral`: Employment status
- `Antiguedad.Laboral`: Job tenure (months)
- `Cargo.que.ocupa.en.la.Empresa`: Position in company
- `work_experience`: Work experience

**Geographic:**
- `Localidad`: Locality
- `Provincia.de.Domicilio`: Province of residence
- `Ciudad.de.Domicilio`: City of residence
- `Provincia.De.Trabajo`: Work province

**Property Variables:**
- `Tipo.de.Inmueble.a.Financiar`: Property type to finance
- `Estado.del.Bien.a.Financiar`: Property condition
- `Tipo.de.Vivienda`: Housing type
- `Garantia.Hipotecaria`: Mortgage guarantee

#### Variables with High Missing Values
(Excluded from analysis per lines 153-170):
- Financial ratios and calculated metrics
- System-level debt metrics
- Property valuation details
- Various demographic details

## Development Workflows

### Working with R Markdown

1. **Opening/Editing:**
   ```r
   # In RStudio
   file.edit("Credit Scoring Model.Rmd")
   ```

2. **Running Analysis:**
   ```r
   # Knit to HTML
   rmarkdown::render("Credit Scoring Model.Rmd")

   # Or run chunks individually in RStudio
   ```

3. **Interactive Development:**
   - Execute code chunks sequentially
   - Validate outputs before proceeding
   - Check summary statistics after each transformation

### Git Workflow

**Current Branch:** `claude/claude-md-mkplbv1l93sny6si-WYzlK`

```bash
# Check status
git status

# Stage changes
git add <files>

# Commit with descriptive message
git commit -m "Description of changes"

# Push to feature branch
git push -u origin claude/claude-md-mkplbv1l93sny6si-WYzlK
```

**Important:** Always work on feature branches starting with `claude/` prefix.

## Code Conventions and Patterns

### Naming Conventions

1. **Variables:** Period-separated names (R convention)
   - Example: `Ingresos.Mensuales`, `Tipo.Scoring`
   - Some use snake_case: `loss_given_default`, `fico_score`

2. **Data Frames:**
   - Original: `data`
   - Filtered: `nueva.data`, `nueva.data1`
   - Cleaned: `new_data_delete_variables`, `loan_data_no_NA`

3. **Models:**
   - Base model: `model`
   - Fitted model: `model_fit`

### R Code Style

1. **Assignment:** Use `<-` for assignment (R convention)
   ```r
   nueva.data <- data %>% filter(Tipo.Scoring == "VIV")
   ```

2. **Piping:** tidyverse pipe operator `%>%`
   ```r
   data %>% filter() %>% select() %>% mutate()
   ```

3. **Function Calls:** Explicit parameter names when useful
   ```r
   CrossTable(nueva.data$Dictamen, prop.r = TRUE, prop.c = FALSE)
   ```

### Statistical Analysis Patterns

1. **Descriptive Statistics First:**
   - Always use `str()` and `summary()` before analysis
   - Cross-tabulate categorical variables with target
   - Visualize distributions with histograms and boxplots

2. **Outlier Detection:**
   ```r
   n_breaks <- sqrt(nrow(nueva.data))  # Sturges' rule
   hist(variable, breaks = n_breaks)
   boxplot(variable)
   index_outliers <- which(variable > threshold)
   clean_data <- data[-index_outliers, ]
   ```

3. **Missing Data Strategy:**
   - Document all variables with NAs
   - Delete variables with excessive missingness
   - Remove rows with NAs in critical variables

4. **Model Validation:**
   - Use `set.seed()` for reproducibility
   - 70/30 train-test split via `createDataPartition()`
   - Evaluate with AUC metric

## AI Assistant Guidelines

### When Modifying This Codebase

1. **Always Read First:**
   - Read `Credit Scoring Model.Rmd` before making any changes
   - Understand the data flow: import → filter → clean → model → evaluate

2. **Preserve Structure:**
   - Maintain R Markdown code chunk structure
   - Keep section comments intact
   - Preserve reproducibility with `set.seed()`

3. **Variable Handling:**
   - Use period-separated names for consistency with existing code
   - Document any new variables with comments
   - Update the list of variables with missing data if applicable

4. **Statistical Rigor:**
   - Always validate data transformations with `summary()` or `table()`
   - Check for missing values after operations
   - Document assumptions and thresholds used

5. **File Paths:**
   - Note: Data file path is hardcoded (Windows path)
   - When suggesting changes, recommend using relative paths or `file.choose()`
   - Use forward slashes or `file.path()` for cross-platform compatibility

6. **Library Management:**
   - Always check if required libraries are loaded
   - Add new library calls to the top chunk if needed
   - Document any new dependencies

### Common Tasks

#### Adding New Variables
```r
# 1. Create the variable
nueva.data$new_variable <- calculation

# 2. Check for missing values
summary(nueva.data$new_variable)

# 3. Visualize if continuous
hist(nueva.data$new_variable, main = "Histogram of New Variable")
boxplot(nueva.data$new_variable)

# 4. Cross-tabulate if categorical
CrossTable(nueva.data$new_variable, nueva.data$Dictamen)
```

#### Adding New Predictors to Model
```r
# Update the formula with new variables
model_fit <- glm(Dictamen ~ existing_vars + new_var1 + new_var2,
                 data = train_data,
                 family = binomial(link = "logit"))
```

#### Changing Data Source
```r
# Replace hardcoded path with:
file_path <- file.choose()  # Interactive selection
# OR
file_path <- file.path("data", "Base_scoring_modificada_final.xlsx")
data <- openxlsx::read.xlsx(file_path)
```

### Testing Changes

1. **Test Data Loading:**
   - Ensure `str(data)` shows expected structure
   - Verify `table(data$Tipo.Scoring)` shows loan types

2. **Test Filtering:**
   - Check `nrow(nueva.data)` for reasonable count
   - Verify all rows have `Tipo.Scoring == "VIV"`

3. **Test Model:**
   - Ensure no errors during `glm()` fitting
   - Check model summary for convergence
   - Verify AUC is between 0.5 and 1.0

### Known Issues and Considerations

1. **Hardcoded Paths:**
   - Data file path is Windows-specific and absolute
   - Needs updating for portability

2. **Language Mix:**
   - Variable names are in Spanish
   - Code comments are in English
   - This is acceptable but be aware when adding new variables

3. **Incomplete Sections:**
   - Lines 186-188: Model defined but not immediately used
   - Lines 194-202: Alternative model definition (may be redundant)
   - Consider consolidating duplicate model definitions

4. **Missing Data Handling:**
   - Lines 153-181: Data cleaning code references undefined objects
   - Variables like `new_data` and `loan_data` used before definition
   - Needs careful review and testing

5. **Code Comments:**
   - Some commented-out code (lines 42, 56-58, 88-91)
   - Should be removed if not needed or uncommented if useful

### Best Practices for This Project

1. **Reproducibility:**
   - Always set seed before random operations
   - Document data transformations clearly
   - Save intermediate datasets if workflow is complex

2. **Data Quality:**
   - Check data quality after each transformation
   - Document decisions about outliers and missing data
   - Keep track of sample size changes

3. **Model Documentation:**
   - Document model performance metrics
   - Explain variable selection decisions
   - Compare multiple models if applicable

4. **Code Organization:**
   - Keep data import separate from processing
   - Group related visualizations together
   - Separate EDA from modeling sections

5. **Version Control:**
   - Commit logical units of work
   - Use descriptive commit messages
   - Don't commit large data files (use .gitignore)

## Data Privacy and Security

- This project analyzes personal financial data
- Ensure data files are **never committed** to version control
- Add data files to `.gitignore`:
  ```
  *.xlsx
  *.xls
  *.csv
  data/
  ```
- When sharing code, use synthetic or anonymized sample data

## Future Enhancements

Potential improvements for this project:

1. **Configuration Management:**
   - Create config file for paths and parameters
   - Externalize model hyperparameters

2. **Modularization:**
   - Separate data cleaning into reusable functions
   - Create helper functions for repeated analyses

3. **Enhanced Documentation:**
   - Add README.md with project description
   - Document data dictionary for variables
   - Create separate documentation for model methodology

4. **Testing:**
   - Add unit tests for data transformations
   - Validate data quality checks
   - Test model performance on holdout set

5. **Visualization:**
   - Create dashboard for model results
   - Add feature importance plots
   - Visualize model predictions vs. actuals

6. **Model Improvements:**
   - Implement cross-validation
   - Try ensemble methods (Random Forest, XGBoost)
   - Perform feature engineering and selection

## Resources

### R Documentation
- [R Markdown Guide](https://rmarkdown.rstudio.com/lesson-1.html)
- [caret Package](https://topepo.github.io/caret/)
- [tidyverse Documentation](https://www.tidyverse.org/)

### Credit Scoring Resources
- Risk management best practices
- Basel II/III capital requirements
- Local regulatory requirements (Ecuador)

### Getting Help

- R Help: `?function_name` or `help(function_name)`
- Package vignettes: `vignette(package = "package_name")`
- Stack Overflow: [r] tag for R-specific questions

---

**Last Updated:** 2026-01-22
**Document Version:** 1.0
**Maintained by:** AI Assistant (Claude)
