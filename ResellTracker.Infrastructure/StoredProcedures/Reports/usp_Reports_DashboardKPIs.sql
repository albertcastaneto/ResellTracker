CREATE OR ALTER PROCEDURE [dbo].[usp_Reports_DashboardKPIs]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        (SELECT COUNT(*)            FROM [InventoryItems] WHERE Status = 'Active')                                     AS TotalActiveListings,
        (SELECT ISNULL(SUM(Cogs),0) FROM [InventoryItems])                                                            AS TotalInventoryValue,
        (SELECT ISNULL(SUM(Cogs),0) FROM [InventoryItems] WHERE Status = 'Active')                                    AS CashTiedInStock,
        (SELECT ISNULL(SUM(SalePrice),0) FROM [SaleLogs]
            WHERE YEAR(DateSold) = YEAR(GETUTCDATE()) AND MONTH(DateSold) = MONTH(GETUTCDATE()))                       AS CurrentMonthRevenue,
        (SELECT ISNULL(SUM(NetProfit),0) FROM [SaleLogs]
            WHERE YEAR(DateSold) = YEAR(GETUTCDATE()) AND MONTH(DateSold) = MONTH(GETUTCDATE()))                       AS CurrentMonthProfit,
        (SELECT CASE WHEN COUNT(*) = 0 THEN 0.0
                     ELSE CAST(SUM(CASE WHEN Status = 'Sold' THEN 1 ELSE 0 END) AS DECIMAL(10,4)) / COUNT(*) * 100
                END FROM [InventoryItems])                                                                              AS OverallSellThroughRate,
        (SELECT COUNT(*)          FROM [SaleLogs])                                                                    AS TotalItemsSold,
        (SELECT ISNULL(AVG(NetProfit),0) FROM [SaleLogs])                                                            AS AvgNetProfit;
END
