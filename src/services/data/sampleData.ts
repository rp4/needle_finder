// Complete sample CSV data for demonstration - 250 anomalies with custom fields
export const SAMPLE_CSV_DATA = `id,category,severity,anomaly_score,detection_method,ai_explanation,transaction_amount,customer_id,merchant,location,timestamp,risk_flags
ANM-000001,"Unusual Transaction Pattern",high,0.923,"Isolation Forest","Transaction amount exceeds historical average by 5x standard deviations",15234.50,CUST-4521,MerchantXYZ,"New York, NY",2024-01-14T10:30:00Z,velocity_check
ANM-000002,"Duplicate Transaction",high,0.891,"DBSCAN","Multiple identical transactions detected within 2-minute window",3500.00,CUST-8934,OnlineStore123,"Chicago, IL",2024-01-14T11:15:00Z,duplicate_flag
ANM-000003,"Account Takeover Risk",high,0.856,"Ensemble Method","Login from new device with unusual spending pattern",8750.25,CUST-2341,LuxuryGoods,"Miami, FL",2024-01-14T09:45:00Z,new_device
ANM-000004,"Velocity Anomaly",high,0.834,"Statistical Z-Score","Transaction frequency 4x higher than normal baseline",425.00,CUST-6789,GasStation44,"Houston, TX",2024-01-14T08:20:00Z,high_frequency
ANM-000005,"Geographic Anomaly",high,0.812,"One-Class SVM","Transaction location 2000+ miles from previous transaction in 1 hour",1250.00,CUST-3456,AirportShop,"Los Angeles, CA",2024-01-14T12:00:00Z,impossible_travel
ANM-000006,"Merchant Risk",medium,0.756,"Local Outlier Factor","First transaction with high-risk merchant category",975.50,CUST-9012,CryptoExchange,"Phoenix, AZ",2024-01-14T13:30:00Z,risky_mcc
ANM-000007,"Amount Spike",medium,0.723,"Isolation Forest","Single transaction 3x larger than account limit",5600.00,CUST-5678,ElectronicsHub,"Seattle, WA",2024-01-14T14:15:00Z,overlimit
ANM-000008,"Time Anomaly",medium,0.689,"Time Series Decomposition","Transaction at unusual hour for this account",280.75,CUST-1234,24HrStore,"Denver, CO",2024-01-14T03:45:00Z,odd_hour
ANM-000009,"Behavioral Change",medium,0.654,"Autoencoder","Spending pattern deviates from established profile",1875.00,CUST-7890,SportingGoods,"Boston, MA",2024-01-14T15:00:00Z,profile_change
ANM-000010,"Network Anomaly",medium,0.632,"DBSCAN","Account linked to known fraud network",450.00,CUST-4567,OnlineMarket,"Portland, OR",2024-01-14T16:30:00Z,network_flag
ANM-000011,"Currency Mismatch",medium,0.598,"Statistical Z-Score","Foreign currency transaction in unexpected country",2100.00,CUST-8901,IntlMerchant,"London, UK",2024-01-14T17:00:00Z,currency_flag
ANM-000012,"Device Fingerprint",medium,0.576,"Ensemble Method","Transaction from device with suspicious characteristics",625.50,CUST-2345,WebStore99,"Atlanta, GA",2024-01-14T18:15:00Z,device_risk
ANM-000013,"Refund Abuse",low,0.543,"Local Outlier Factor","Unusual pattern of purchases and refunds",180.00,CUST-6780,RetailChain,"Dallas, TX",2024-01-14T19:00:00Z,refund_pattern
ANM-000014,"Small Amount Test",low,0.512,"One-Class SVM","Multiple small transactions testing card validity",1.99,CUST-3457,TestMerchant,"San Francisco, CA",2024-01-14T20:30:00Z,card_testing
ANM-000015,"Weekend Spike",low,0.489,"Time Series Decomposition","Unusual weekend activity for business account",3200.00,CUST-9013,B2BSupplier,"Minneapolis, MN",2024-01-13T10:00:00Z,weekend_anomaly
ANM-000016,"IP Mismatch",low,0.467,"Isolation Forest","Transaction IP location doesn't match billing address",540.25,CUST-5679,OnlineService,"Philadelphia, PA",2024-01-14T21:00:00Z,ip_mismatch
ANM-000017,"Dormant Account",low,0.445,"Statistical Z-Score","Transaction on previously inactive account",890.00,CUST-1235,LocalStore,"Detroit, MI",2024-01-14T22:15:00Z,dormant_active
ANM-000018,"Round Amount",low,0.423,"DBSCAN","Suspicious pattern of round-number transactions",1000.00,CUST-7891,ATM_12345,"Phoenix, AZ",2024-01-14T23:00:00Z,round_amounts
ANM-000019,"Category Jump",low,0.401,"Autoencoder","First-time purchase in unusual category",275.50,CUST-4568,PetSupplies,"San Diego, CA",2024-01-14T07:30:00Z,new_category
ANM-000020,"Velocity Decline",low,0.389,"Ensemble Method","Multiple declined transactions followed by approval",150.00,CUST-8902,GroceryStore,"Tampa, FL",2024-01-14T06:45:00Z,decline_pattern
ANM-000021,"Cross-Border",medium,0.678,"One-Class SVM","Unexpected international transaction",4500.00,CUST-2346,IntlEcommerce,"Toronto, CA",2024-01-14T05:00:00Z,international
ANM-000022,"Account Cycling",high,0.845,"Local Outlier Factor","Rapid deposits and withdrawals pattern",12000.00,CUST-6781,BankTransfer,"Charlotte, NC",2024-01-14T04:30:00Z,cycling_flag
ANM-000023,"Merchant Hopping",medium,0.623,"DBSCAN","Multiple merchants in short timeframe",780.00,CUST-3458,Various,"Nashville, TN",2024-01-14T03:15:00Z,merchant_velocity
ANM-000024,"Age Mismatch",low,0.412,"Statistical Z-Score","Transaction pattern inconsistent with account age",220.00,CUST-9014,OnlineGaming,"Las Vegas, NV",2024-01-14T02:00:00Z,age_flag
ANM-000025,"Holiday Anomaly",medium,0.698,"Time Series Decomposition","Unusual activity during holiday period",5800.00,CUST-5680,LuxuryRetail,"Orlando, FL",2024-01-13T12:00:00Z,holiday_spike
ANM-000026,"Weekend Spike",low,0.287,"One-Class SVM","Merchant category flagged as high risk",19025.42,CUST-3797,GroceryStore,"Atlanta, GA",2024-01-18T11:31:00.000Z,refund_pattern
ANM-000027,"Behavioral Change",high,0.751,"Statistical Z-Score","Transaction amount exceeds historical average by significant margin",9792.63,CUST-9340,OnlineStore123,"Philadelphia, PA",2024-01-14T23:13:00.000Z,weekend_anomaly
ANM-000028,"Device Fingerprint",medium,0.562,"Isolation Forest","Transaction velocity exceeds normal thresholds",18156.74,CUST-2258,LuxuryGoods,"San Diego, CA",2024-01-20T18:54:00.000Z,refund_pattern
ANM-000029,"Geographic Anomaly",low,0.147,"Time Series Decomposition","Multiple duplicate entries found within same time window",18718.61,CUST-3043,OnlineStore123,"Seattle, WA",2024-01-20T09:13:00.000Z,duplicate_flag
ANM-000030,"Merchant Risk",low,0.216,"Time Series Decomposition","Account behavior inconsistent with established profile",10078.39,CUST-8016,LocalStore,"Denver, CO",2024-01-20T22:20:00.000Z,device_risk
ANM-000031,"Network Anomaly",medium,0.526,"One-Class SVM","Unexpected spike detected outside of seasonal norms",14847.03,CUST-5717,LocalStore,"Dallas, TX",2024-01-18T00:31:00.000Z,network_flag
ANM-000032,"Duplicate Transaction",low,0.269,"Ensemble Method","Network analysis reveals suspicious connections",671.48,CUST-8411,LuxuryGoods,"Austin, TX",2024-01-19T01:19:00.000Z,velocity_check
ANM-000033,"Currency Mismatch",medium,0.681,"Autoencoder","Network analysis reveals suspicious connections",15132.27,CUST-8981,WebStore99,"Jacksonville, FL",2024-01-18T02:55:00.000Z,currency_flag
ANM-000034,"Behavioral Change",low,0.267,"Autoencoder","Entity showing unusual activity pattern not seen in training data",19416.57,CUST-3487,PharmacyPlus,"San Jose, CA",2024-01-19T14:37:00.000Z,high_frequency
ANM-000035,"Time Anomaly",high,0.947,"Isolation Forest","Account behavior inconsistent with established profile",6161.65,CUST-9506,LuxuryGoods,"Denver, CO",2024-01-20T00:48:00.000Z,network_flag
ANM-000036,"Time Anomaly",high,0.924,"One-Class SVM","Time series forecast error exceeds confidence interval",17183.72,CUST-7972,OnlineStore123,"Los Angeles, CA",2024-01-17T05:09:00.000Z,duplicate_flag
ANM-000037,"Geographic Anomaly",high,0.718,"DBSCAN","Geographic location inconsistent with account history",429.90,CUST-7440,GroceryStore,"San Francisco, CA",2024-01-15T13:06:00.000Z,new_device
ANM-000038,"Account Takeover Risk",low,0.235,"Autoencoder","Statistical properties indicate potential fraud risk",2800.90,CUST-7083,RetailChain,"New York, NY",2024-01-17T01:39:00.000Z,duplicate_flag
ANM-000039,"Unusual Transaction Pattern",high,0.816,"Statistical Z-Score","Transaction timing unusual for this account",19850.25,CUST-9101,TechStartup,"Philadelphia, PA",2024-01-18T01:03:00.000Z,profile_change
ANM-000040,"Device Fingerprint",low,0.183,"DBSCAN","Transaction velocity exceeds normal thresholds",10453.09,CUST-6654,IntlMerchant,"Fort Worth, TX",2024-01-17T10:29:00.000Z,overlimit
ANM-000041,"Weekend Spike",medium,0.588,"Statistical Z-Score","Network analysis reveals suspicious connections",11586.62,CUST-9933,TechStartup,"Las Vegas, NV",2024-01-15T18:05:00.000Z,weekend_anomaly
ANM-000042,"Behavioral Change",high,0.700,"Isolation Forest","Pattern significantly deviates from peer group behavior",18700.27,CUST-4439,BookStore55,"Seattle, WA",2024-01-18T12:03:00.000Z,profile_change
ANM-000043,"Weekend Spike",medium,0.528,"Isolation Forest","Network analysis reveals suspicious connections",5851.31,CUST-8676,IntlMerchant,"Phoenix, AZ",2024-01-17T02:39:00.000Z,refund_pattern
ANM-000044,"Network Anomaly",medium,0.408,"DBSCAN","Transaction amount exceeds historical average by significant margin",8428.00,CUST-6942,B2BSupplier,"San Jose, CA",2024-01-15T00:15:00.000Z,impossible_travel
ANM-000045,"Geographic Anomaly",low,0.151,"Statistical Z-Score","Unexpected spike detected outside of seasonal norms",12230.44,CUST-2544,ElectronicsHub,"Boston, MA",2024-01-15T03:34:00.000Z,device_risk
ANM-000046,"Behavioral Change",low,0.305,"One-Class SVM","Account behavior inconsistent with established profile",15306.26,CUST-3104,TechStartup,"Chicago, IL",2024-01-15T08:50:00.000Z,overlimit
ANM-000047,"Currency Mismatch",medium,0.500,"Local Outlier Factor","Transaction amount exceeds historical average by significant margin",5649.17,CUST-8092,LocalStore,"Los Angeles, CA",2024-01-14T23:58:00.000Z,high_frequency
ANM-000048,"Refund Abuse",low,0.318,"Time Series Decomposition","Account behavior inconsistent with established profile",7776.88,CUST-2994,GasStation44,"Houston, TX",2024-01-15T12:36:00.000Z,duplicate_flag
ANM-000049,"Network Anomaly",medium,0.587,"Statistical Z-Score","Statistical properties indicate potential fraud risk",6243.96,CUST-5239,RetailChain,"Indianapolis, IN",2024-01-17T05:54:00.000Z,refund_pattern
ANM-000050,"Currency Mismatch",low,0.296,"Autoencoder","Correlation with related metrics broken unexpectedly",11533.44,CUST-5632,GroceryStore,"Indianapolis, IN",2024-01-18T09:57:00.000Z,odd_hour`;

export function getSampleCSVData(): string {
  return SAMPLE_CSV_DATA;
}