CREATE OR ALTER PROCEDURE [dbo].[usp_Reports_CategoryPerformance]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        c.Name                                                                                          AS CategoryName,
        COUNT(DISTINCT i.Id)                                                                            AS TotalListed,
        COUNT(DISTINCT sl.Id)                                                                           AS TotalSold,
        CASE WHEN COUNT(DISTINCT i.Id) = 0 THEN 0.0
             ELSE CAST(COUNT(DISTINCT sl.Id) AS DECIMAL(10,4)) / COUNT(DISTINCT i.Id) * 100
        END                                                                                             AS SellThroughRate,
        ISNULL(AVG(sl.SalePrice), 0)                                                                   AS AvgSalePrice,
        ISNULL(AVG(i.Cogs),       0)                                                                   AS AvgCogs,
        ISNULL(AVG(sl.NetProfit), 0)                                                                   AS AvgNetProfit,
        ISNULL(SUM(sl.SalePrice), 0)                                                                   AS TotalRevenue,
        ISNULL(SUM(sl.NetProfit), 0)                                                                   AS TotalProfit
    FROM [Categories] c
    LEFT JOIN [InventoryItems] i  ON c.Id  = i.CategoryId
    LEFT JOIN [SaleLogs]       sl ON i.Id  = sl.InventoryId
    GROUP BY c.Id, c.Name
    ORDER BY TotalRevenue DESC;
END
