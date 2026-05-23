CREATE OR ALTER PROCEDURE [dbo].[usp_Reports_SupplierROI]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        s.Name                                                                                    AS SupplierName,
        COUNT(DISTINCT i.Id)                                                                      AS TotalItemsBought,
        ISNULL(SUM(i.Cogs),        0)                                                            AS TotalSpent,
        COUNT(DISTINCT sl.Id)                                                                     AS TotalItemsSold,
        ISNULL(SUM(sl.SalePrice),  0)                                                            AS TotalRevenue,
        ISNULL(SUM(sl.NetProfit),  0)                                                            AS TotalProfit,
        CASE WHEN ISNULL(SUM(i.Cogs), 0) = 0 THEN 0.0
             ELSE ISNULL(SUM(sl.NetProfit), 0) / SUM(i.Cogs) * 100
        END                                                                                       AS RoiPercentage
    FROM [Suppliers] s
    LEFT JOIN [InventoryItems] i  ON s.Id = i.SupplierId
    LEFT JOIN [SaleLogs]       sl ON i.Id = sl.InventoryId
    GROUP BY s.Id, s.Name
    ORDER BY RoiPercentage DESC;
END
