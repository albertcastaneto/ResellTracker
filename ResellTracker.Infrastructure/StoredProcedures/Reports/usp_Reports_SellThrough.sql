CREATE OR ALTER PROCEDURE [dbo].[usp_Reports_SellThrough]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        c.Name                                                                                        AS CategoryName,
        COUNT(DISTINCT i.Id)                                                                          AS TotalListed,
        COUNT(DISTINCT sl.Id)                                                                         AS TotalSold,
        CASE WHEN COUNT(DISTINCT i.Id) = 0 THEN 0.0
             ELSE CAST(COUNT(DISTINCT sl.Id) AS DECIMAL(10,4)) / COUNT(DISTINCT i.Id) * 100
        END                                                                                           AS SellThroughRate,
        ISNULL(AVG(CAST(sl.DaysToSell AS DECIMAL(10,2))), 0)                                        AS AvgDaysToSell
    FROM [Categories] c
    LEFT JOIN [InventoryItems] i  ON c.Id = i.CategoryId
    LEFT JOIN [SaleLogs]       sl ON i.Id = sl.InventoryId
    GROUP BY c.Id, c.Name
    ORDER BY SellThroughRate DESC;
END
