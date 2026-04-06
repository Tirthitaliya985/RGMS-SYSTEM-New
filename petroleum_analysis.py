"""
Petroleum Data Analysis - Enhanced with Multiple Predictions
Course 602
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, accuracy_score, confusion_matrix
from sklearn.preprocessing import PolynomialFeatures, LabelEncoder
from sklearn.pipeline import make_pipeline
import warnings
import io
warnings.filterwarnings('ignore')
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

# Core utilities
def load_data(f):
    try:
        d = pd.read_csv(f)
        d.columns = d.columns.str.strip()
        print("✅ Loaded")
        return d
    except:
        print("❌ Error loading file")
        return None

def filt(d, p):
    return d.copy() if not p or p == "All Products" else d[d['Product Name'] == p].copy()

def show():
    print("\n[Close plot]")
    plt.show()

# Task 1: Data Understanding
def t1(d, p=None):
    print("\n" + "="*50 + "\nTASK 1: DATA UNDERSTANDING\n" + "="*50)
    df = filt(d, p)
    print(f"\nShape: {df.shape}\nHead:\n{df.head()}\nTail:\n{df.tail()}")
    print(f"\nNumerical: {list(df.select_dtypes(include=[np.number]).columns)}")
    print(f"Categorical: {list(df.select_dtypes(include=['object']).columns)}")
    return df

# Task 2: EDA
def t2(d, p=None):
    print("\n" + "="*50 + "\nTASK 2: EDA\n" + "="*50)
    df = filt(d, p)
    cols = ['Volume (TMT)', 'Value (USD Million)', 'Price per MT (USD)']
    f, ax = plt.subplots(2, 3, figsize=(15, 8))
    for i, c in enumerate(cols):
        ax[0, i].hist(df[c].dropna(), bins=30, color='skyblue')
        ax[0, i].set_title(f'Dist of {c}')
        ax[1, i].boxplot(df[c].dropna())
        ax[1, i].set_title(f'Boxplot {c}')
    plt.tight_layout()
    show()

    f, ax = plt.subplots(2, 2, figsize=(12, 10))
    ax[0,0].scatter(df['Volume (TMT)'], df['Value (USD Million)'], alpha=0.5)
    ax[0,0].set_xlabel('Vol'); ax[0,0].set_ylabel('Val')
    ax[0,1].scatter(df['Volume (TMT)'], df['Price per MT (USD)'], alpha=0.5, color='orange')
    ax[0,1].set_xlabel('Vol'); ax[0,1].set_ylabel('Price')
    ax[1,0].scatter(df['Value (USD Million)'], df['Price per MT (USD)'], alpha=0.5, color='green')
    ax[1,0].set_xlabel('Val'); ax[1,0].set_ylabel('Price')
    sns.heatmap(df[cols].corr(), annot=True, cmap='coolwarm', ax=ax[1,1])
    ax[1,1].set_title('Correlation')
    plt.tight_layout()
    show()

    sns.pairplot(df[cols])
    plt.suptitle('Pairplot')
    show()
    return df

# Task 3: Missing & Outliers
def t3(d, p=None):
    print("\n" + "="*50 + "\nTASK 3: MISSING & OUTLIERS\n" + "="*50)
    df = filt(d, p)
    miss = df.isnull().sum()
    if miss.sum() > 0:
        print(f"Missing:\n{miss[miss>0]}")
        for c in df.select_dtypes(include=[np.number]).columns:
            if df[c].isnull().sum() > 0:
                df[c].fillna(df[c].median(), inplace=True)
        print("✅ Filled missing")

    f, ax = plt.subplots(1, 3, figsize=(15, 4))
    for i, c in enumerate(['Volume (TMT)', 'Value (USD Million)', 'Price per MT (USD)']):
        ax[i].boxplot(df[c].dropna())
        ax[i].set_title(c)
        Q1, Q3 = df[c].quantile(0.25), df[c].quantile(0.75)
        IQR = Q3 - Q1
        out = df[(df[c] < Q1 - 1.5*IQR) | (df[c] > Q3 + 1.5*IQR)]
        print(f"{c}: {len(out)} outliers")
    plt.tight_layout()
    show()
    return df

# Task 4: Spread of Data
def t4(d, p=None):
    print("\n" + "="*50 + "\nTASK 4: SPREAD\n" + "="*50)
    df = filt(d, p)
    cols = ['Volume (TMT)', 'Value (USD Million)', 'Price per MT (USD)']
    f, ax = plt.subplots(1, 3, figsize=(15, 4))
    for i, c in enumerate(cols):
        ax[i].hist(df[c].dropna(), bins=30, density=True, alpha=0.7, color='skyblue')
        df[c].dropna().plot(kind='kde', ax=ax[i], color='red')
        ax[i].set_title(c)
        m, med, s = df[c].mean(), df[c].median(), df[c].std()
        sk, k = df[c].skew(), df[c].kurtosis()
        print(f"\n{c}: Mean={m:.2f}, Median={med:.2f}, Std={s:.2f}")
        print(f"  Skew={sk:.2f}, Kurt={k:.2f}")
    plt.tight_layout()
    show()
    return df

# Task 5: Automated EDA
def t5(d, p=None):
    print("\n" + "="*50 + "\nTASK 5: AUTO EDA\n" + "="*50)
    df = filt(d, p)
    print("\nDescribe:\n", df.describe())
    print("\nInfo:")
    b = io.StringIO()
    df.info(buf=b)
    print(b.getvalue())
    print(f"\nMissing: {df.isnull().sum().sum()}")
    print(f"Correlation:\n{df.select_dtypes(include=[np.number]).corr()}")
    def qe(d, n="Data"):
        print(f"\n--- {n} ---\nShape: {d.shape}\nMissing: {d.isnull().sum().sum()}")
    qe(df, "Petroleum")
    return df

# Task 6-7: Regression
def t6_7(d, p=None):
    print("\n" + "="*50 + "\nTASK 6-7: REGRESSION\n" + "="*50)
    df = filt(d, p)
    md = df[['Volume (TMT)', 'Price per MT (USD)', 'Value (USD Million)']].dropna()
    if len(md) < 10:
        print("❌ Insufficient data")
        return df

    X, y = md[['Volume (TMT)']], md['Value (USD Million)']
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
    model = LinearRegression().fit(X_tr, y_tr)
    y_pred = model.predict(X_te)
    print(f"\nSimple LR: Value={model.intercept_:.4f}+{model.coef_[0]:.4f}×Vol")
    print(f"R² Train={r2_score(y_tr, model.predict(X_tr)):.4f}, Test={r2_score(y_te, y_pred):.4f}")

    Xm = md[['Volume (TMT)', 'Price per MT (USD)']]
    X_trm, X_tem, _, _ = train_test_split(Xm, y, test_size=0.2, random_state=42)
    multi = LinearRegression().fit(X_trm, y_tr)
    y_predm = multi.predict(X_tem)
    print(f"\nMulti LR R² Test={r2_score(y_te, y_predm):.4f}")

    f, ax = plt.subplots(1, 2, figsize=(12, 4))
    ax[0].scatter(X_te, y_te, alpha=0.6, label='Actual')
    ax[0].scatter(X_te, y_pred, alpha=0.6, label='Pred')
    ax[0].plot(X_te, y_pred, 'g-')
    ax[0].legend()
    ax[0].set_title('Simple LR')
    ax[1].scatter(y_pred, y_te - y_pred, alpha=0.6)
    ax[1].axhline(y=0, color='r', ls='--')
    ax[1].set_title('Residuals')
    plt.tight_layout()
    show()
    return df

# Task 8: Logistic Regression
def t8(d, p=None):
    print("\n" + "="*50 + "\nTASK 8: LOGISTIC\n" + "="*50)
    df = filt(d, p)
    med = df['Value (USD Million)'].median()
    df['ValCat'] = (df['Value (USD Million)'] > med).astype(int)
    feat = ['Volume (TMT)', 'Price per MT (USD)']
    md = df[feat + ['ValCat']].dropna()
    if len(md) < 10:
        print("❌ Insufficient data")
        return df

    X, y = md[feat], md['ValCat']
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
    log = LogisticRegression(random_state=42).fit(X_tr, y_tr)
    print(f"\nAcc: Train={accuracy_score(y_tr, log.predict(X_tr)):.4f}, Test={accuracy_score(y_te, log.predict(X_te)):.4f}")
    print(f"CM:\n{confusion_matrix(y_te, log.predict(X_te))}")
    return df

# Task 9: Overfitting
def t9(d, p=None):
    print("\n" + "="*50 + "\nTASK 9: OVERFITTING\n" + "="*50)
    df = filt(d, p)
    md = df[['Volume (TMT)', 'Value (USD Million)']].dropna()
    if len(md) < 20:
        print("❌ Insufficient data")
        return df

    X, y = md[['Volume (TMT)']], md['Value (USD Million)']
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)
    tr_err, te_err, deg = [], [], [1, 2, 3, 4, 5]

    for dg in deg:
        m = make_pipeline(PolynomialFeatures(dg), LinearRegression()).fit(X_tr, y_tr)
        tr_err.append(mean_squared_error(y_tr, m.predict(X_tr)))
        te_err.append(mean_squared_error(y_te, m.predict(X_te)))

    plt.figure(figsize=(8, 4))
    plt.plot(deg, tr_err, 'bo-', label='Train')
    plt.plot(deg, te_err, 'ro-', label='Test')
    plt.xlabel('Degree')
    plt.ylabel('MSE')
    plt.legend()
    plt.grid(True)
    plt.title('Overfitting')
    show()

    best = deg[np.argmin(te_err)]
    print(f"Best degree: {best}, Test MSE: {min(te_err):.2f}")
    return df

# Task 10-13: Evaluation & Viz
def t10_13(d, p=None):
    print("\n" + "="*50 + "\nTASK 10-13: EVAL & VIZ\n" + "="*50)
    df = filt(d, p)

    pr_th = df['Price per MT (USD)'].median()
    df['Profit'] = (df['Price per MT (USD)'] > pr_th).astype(int)
    print(f"\nClass: Profit={df['Profit'].sum()}, Not={len(df)-df['Profit'].sum()}")

    rd = df[['Volume (TMT)', 'Value (USD Million)']].dropna()
    if len(rd) >= 10:
        X, y = rd[['Volume (TMT)']], rd['Value (USD Million)']
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
        m = LinearRegression().fit(X_tr, y_tr)
        yp = m.predict(X_te)
        mse = mean_squared_error(y_te, yp)
        print(f"\nReg Metrics: MSE={mse:.4f}, RMSE={np.sqrt(mse):.4f}, MAE={mean_absolute_error(y_te, yp):.4f}, R²={r2_score(y_te, yp):.4f}")

    f = plt.figure(figsize=(16, 12))
    titles = ['Vol Dist', 'Price Dist', 'Vol vs Val', 'Vol Box', 'Trade', 'Countries', 'Transport', 'Corr', 'Price by Product', 'Monthly Vol', 'Val by Trade', 'Price KDE']
    for i in range(12):
        ax = plt.subplot(3, 4, i+1)
        if i == 0:
            df['Volume (TMT)'].hist(ax=ax, bins=30, color='skyblue')
        elif i == 1:
            df['Price per MT (USD)'].hist(ax=ax, bins=30, color='lightgreen')
        elif i == 2:
            ax.scatter(df['Volume (TMT)'], df['Value (USD Million)'], alpha=0.5)
        elif i == 3:
            df.boxplot(column='Volume (TMT)', ax=ax)
        elif i == 4:
            df['Trade Type'].value_counts().plot(kind='bar', ax=ax, color='coral')
        elif i == 5:
            df['Country of Origin/Destination'].value_counts().head(10).plot(kind='bar', ax=ax, color='gold')
        elif i == 6:
            df['Mode of Transport'].value_counts().plot(kind='pie', ax=ax, autopct='%1.1f%%')
        elif i == 7:
            nc = df.select_dtypes(include=[np.number]).columns[:4]
            if len(nc) > 1:
                sns.heatmap(df[nc].corr(), annot=True, cmap='coolwarm', ax=ax, cbar=False)
        elif i == 8:
            df.groupby('Product Name')['Price per MT (USD)'].mean().nlargest(8).plot(kind='bar', ax=ax, color='lightblue')
        elif i == 9 and 'Month' in df.columns:
            df.groupby('Month')['Volume (TMT)'].sum().plot(kind='line', marker='o', ax=ax, color='purple')
        elif i == 10:
            df.boxplot(column='Value (USD Million)', by='Trade Type', ax=ax)
        elif i == 11:
            df['Price per MT (USD)'].hist(bins=30, density=True, alpha=0.7, ax=ax, color='skyblue')
            df['Price per MT (USD)'].plot(kind='kde', ax=ax, color='red')
        ax.set_title(titles[i])
    plt.tight_layout()
    show()
    return df

# ------------------------------
# Enhanced Prediction Module
# ------------------------------

def train_models(df, prod):
    """Train all prediction models once and return them along with metadata."""
    data = filt(df, prod).copy()

    # 1. Value Prediction (Volume + Price)
    value_data = data[['Volume (TMT)', 'Price per MT (USD)', 'Value (USD Million)']].dropna()
    if len(value_data) >= 5:
        X_val = value_data[['Volume (TMT)', 'Price per MT (USD)']]
        y_val = value_data['Value (USD Million)']
        val_model = LinearRegression().fit(X_val, y_val)
        val_r2 = r2_score(y_val, val_model.predict(X_val))
    else:
        val_model = None
        val_r2 = None

    # 2. Price Prediction (Volume + Trade Type + Country)
    # Encode categoricals
    price_data = data[['Volume (TMT)', 'Trade Type', 'Country of Origin/Destination', 'Price per MT (USD)']].dropna()
    if len(price_data) >= 5:
        # Simple one-hot encoding for categoricals (for demo)
        le_trade = LabelEncoder()
        le_country = LabelEncoder()
        price_data['Trade Type_enc'] = le_trade.fit_transform(price_data['Trade Type'])
        price_data['Country_enc'] = le_country.fit_transform(price_data['Country of Origin/Destination'])
        X_price = price_data[['Volume (TMT)', 'Trade Type_enc', 'Country_enc']]
        y_price = price_data['Price per MT (USD)']
        price_model = LinearRegression().fit(X_price, y_price)
        price_r2 = r2_score(y_price, price_model.predict(X_price))
        price_encoders = (le_trade, le_country)
    else:
        price_model = None
        price_r2 = None
        price_encoders = None

    # 3. Trade Type Prediction (Volume + Price + Product Name)
    trade_data = data[['Volume (TMT)', 'Price per MT (USD)', 'Product Name', 'Trade Type']].dropna()
    if len(trade_data) >= 5:
        # Encode product name
        le_prod = LabelEncoder()
        trade_data['Product_enc'] = le_prod.fit_transform(trade_data['Product Name'])
        X_trade = trade_data[['Volume (TMT)', 'Price per MT (USD)', 'Product_enc']]
        y_trade = trade_data['Trade Type']
        # Convert target to binary: Import=1, Export=0
        y_trade_bin = (y_trade == 'Import').astype(int)
        trade_model = LogisticRegression(random_state=42).fit(X_trade, y_trade_bin)
        trade_acc = accuracy_score(y_trade_bin, trade_model.predict(X_trade))
        trade_encoder = le_prod
    else:
        trade_model = None
        trade_acc = None
        trade_encoder = None

    # 4. Volume Prediction (Price + Trade Type + Country)
    vol_data = data[['Price per MT (USD)', 'Trade Type', 'Country of Origin/Destination', 'Volume (TMT)']].dropna()
    if len(vol_data) >= 5:
        le_vol_trade = LabelEncoder()
        le_vol_country = LabelEncoder()
        vol_data['Trade Type_enc'] = le_vol_trade.fit_transform(vol_data['Trade Type'])
        vol_data['Country_enc'] = le_vol_country.fit_transform(vol_data['Country of Origin/Destination'])
        X_vol = vol_data[['Price per MT (USD)', 'Trade Type_enc', 'Country_enc']]
        y_vol = vol_data['Volume (TMT)']
        vol_model = LinearRegression().fit(X_vol, y_vol)
        vol_r2 = r2_score(y_vol, vol_model.predict(X_vol))
        vol_encoders = (le_vol_trade, le_vol_country)
    else:
        vol_model = None
        vol_r2 = None
        vol_encoders = None

    return {
        'val': (val_model, val_r2),
        'price': (price_model, price_r2, price_encoders),
        'trade': (trade_model, trade_acc, trade_encoder),
        'vol': (vol_model, vol_r2, vol_encoders)
    }

def predict_value(models, prod_name):
    """Predict Value using Volume and Price."""
    val_model, r2 = models['val']
    if val_model is None:
        print("❌ Value prediction model not available (insufficient data).")
        return

    print(f"\n--- Predict Value (USD Million) ---")
    print(f"Model R²: {r2:.4f}")
    try:
        vol = float(input("Volume (TMT): "))
        price = float(input("Price per MT (USD): "))
        pred = val_model.predict([[vol, price]])[0]
        print(f"Predicted Value: {pred:.2f} USD Million")
    except ValueError:
        print("Invalid input. Please enter numeric values.")
    except Exception as e:
        print(f"Error: {e}")

def predict_price(models, prod_name):
    """Predict Price using Volume, Trade Type, Country."""
    price_model, r2, encoders = models['price']
    if price_model is None:
        print("❌ Price prediction model not available (insufficient data).")
        return

    print(f"\n--- Predict Price per MT (USD) ---")
    print(f"Model R²: {r2:.4f}")
    try:
        vol = float(input("Volume (TMT): "))
        trade = input("Trade Type (Import/Export): ").strip()
        country = input("Country of Origin/Destination: ").strip()

        le_trade, le_country = encoders
        # Handle unknown categories: map to most frequent or use -1
        if trade not in le_trade.classes_:
            print(f"Warning: Trade type '{trade}' not seen during training. Using most frequent.")
            trade_enc = le_trade.transform([le_trade.classes_[0]])[0]
        else:
            trade_enc = le_trade.transform([trade])[0]

        if country not in le_country.classes_:
            print(f"Warning: Country '{country}' not seen during training. Using most frequent.")
            country_enc = le_country.transform([le_country.classes_[0]])[0]
        else:
            country_enc = le_country.transform([country])[0]

        pred = price_model.predict([[vol, trade_enc, country_enc]])[0]
        print(f"Predicted Price per MT: {pred:.2f} USD")
    except ValueError:
        print("Invalid input. Please enter numeric values for volume.")
    except Exception as e:
        print(f"Error: {e}")

def predict_trade_type(models, prod_name):
    """Predict Trade Type using Volume, Price, Product Name."""
    trade_model, acc, encoder = models['trade']
    if trade_model is None:
        print("❌ Trade Type prediction model not available (insufficient data).")
        return

    print(f"\n--- Predict Trade Type (Import/Export) ---")
    print(f"Model Accuracy: {acc:.4f}")
    try:
        vol = float(input("Volume (TMT): "))
        price = float(input("Price per MT (USD): "))
        product = input("Product Name: ").strip()

        if product not in encoder.classes_:
            print(f"Warning: Product '{product}' not seen during training. Using most frequent.")
            prod_enc = encoder.transform([encoder.classes_[0]])[0]
        else:
            prod_enc = encoder.transform([product])[0]

        pred = trade_model.predict([[vol, price, prod_enc]])[0]
        trade_type = "Import" if pred == 1 else "Export"
        prob = trade_model.predict_proba([[vol, price, prod_enc]])[0]
        print(f"Predicted Trade Type: {trade_type}")
        print(f"Probability: Export={prob[0]:.3f}, Import={prob[1]:.3f}")
    except ValueError:
        print("Invalid input. Please enter numeric values.")
    except Exception as e:
        print(f"Error: {e}")

def predict_volume(models, prod_name):
    """Predict Volume using Price, Trade Type, Country."""
    vol_model, r2, encoders = models['vol']
    if vol_model is None:
        print("❌ Volume prediction model not available (insufficient data).")
        return

    print(f"\n--- Predict Volume (TMT) ---")
    print(f"Model R²: {r2:.4f}")
    try:
        price = float(input("Price per MT (USD): "))
        trade = input("Trade Type (Import/Export): ").strip()
        country = input("Country of Origin/Destination: ").strip()

        le_trade, le_country = encoders
        if trade not in le_trade.classes_:
            print(f"Warning: Trade type '{trade}' not seen. Using most frequent.")
            trade_enc = le_trade.transform([le_trade.classes_[0]])[0]
        else:
            trade_enc = le_trade.transform([trade])[0]

        if country not in le_country.classes_:
            print(f"Warning: Country '{country}' not seen. Using most frequent.")
            country_enc = le_country.transform([le_country.classes_[0]])[0]
        else:
            country_enc = le_country.transform([country])[0]

        pred = vol_model.predict([[price, trade_enc, country_enc]])[0]
        print(f"Predicted Volume: {pred:.2f} TMT")
    except ValueError:
        print("Invalid input. Please enter numeric values.")
    except Exception as e:
        print(f"Error: {e}")

def t_prediction(d, p=None):
    """Main prediction menu."""
    print("\n" + "="*50 + "\nPREDICTION MENU\n" + "="*50)
    df = filt(d, p)

    # Train all models once
    models = train_models(df, p)

    # Check if any model was trained
    if all(v[0] is None for v in models.values()):
        print("❌ No prediction models could be trained due to insufficient data.")
        return df

    while True:
        print("\n" + "-"*40)
        print("What would you like to predict?")
        print("1. Value (USD Million) from Volume & Price")
        print("2. Price per MT (USD) from Volume, Trade Type, Country")
        print("3. Trade Type (Import/Export) from Volume, Price, Product Name")
        print("4. Volume (TMT) from Price, Trade Type, Country")
        print("0. Back to main menu")
        try:
            choice = int(input("Choice: "))
            if choice == 0:
                break
            elif choice == 1:
                predict_value(models, p)
            elif choice == 2:
                predict_price(models, p)
            elif choice == 3:
                predict_trade_type(models, p)
            elif choice == 4:
                predict_volume(models, p)
            else:
                print("Invalid choice.")
        except ValueError:
            print("Please enter a number.")
        except Exception as e:
            print(f"Error: {e}")

    return df

# Main menu
def main():
    print("="*50 + "\nPETROLEUM ANALYSIS\nCourse 602\n" + "="*50)
    df = load_data("Indian_Petroleum_Dataset_2024_25 (1).csv")
    if df is None:
        return
    print(f"Records: {len(df)}, Products: {df['Product Name'].nunique()}")

    prods = ["All Products"] + sorted(df['Product Name'].unique().tolist())
    prod = None

    while True:
        if not prod:
            print("\nProducts:")
            for i, p in enumerate(prods[:10], 1):
                print(f"{i}. {p}")
            if len(prods) > 10:
                print("...")
            try:
                ch = int(input(f"\nSelect (1-{len(prods)} or 0 exit): "))
                if ch == 0:
                    break
                prod = prods[ch-1] if 1 <= ch <= len(prods) else None
                if prod:
                    print(f"✅ {prod}")
            except:
                print("Invalid")
                continue

        print("\n" + "-"*40 + "\nTASKS:")
        print("1.Data Understanding")
        print("2.Exploratory Data Analysis")
        print("3.Missing Data and Outliers")
        print("4.Spread of Data")
        print("5.Automated EDA")
        print("6.Regression Analysis & Model Building")
        print("7.Logistic Regression (Classification)")
        print("8.Overfitting and Underfitting Analysis")
        print("9.Model Evaluation & Visualization")
        print("10.All")
        print("11.Change product")
        print("12.Prediction (Multiple options)")
        print("0.Exit")
        try:
            t = int(input("Choice: "))
            if t == 0:
                break
            elif t == 11:
                prod = None
                continue
            elif t == 1:
                t1(df, prod)
            elif t == 2:
                t2(df, prod)
            elif t == 3:
                t3(df, prod)
            elif t == 4:
                t4(df, prod)
            elif t == 5:
                t5(df, prod)
            elif t == 6:
                t6_7(df, prod)
            elif t == 7:
                t8(df, prod)
            elif t == 8:
                t9(df, prod)
            elif t == 9:
                t10_13(df, prod)
            elif t == 10:
                for fn in [t1, t2, t3, t4, t5, t6_7, t8, t9, t10_13 , t_prediction]:
                    fn(df, prod)
            elif t == 12:
                t_prediction(df, prod)
            input("\nPress Enter...")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()