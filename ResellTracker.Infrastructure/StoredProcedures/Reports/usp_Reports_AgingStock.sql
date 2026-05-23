CREATE OR ALTER PROCEDURE [dbo].[usp_Reports_AgingStock]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        i.SKU,
        i.Brand,
        c.Name AS CategoryName,
        s.Name AS SupplierName,
        i.DateListed,
        DATEDIFF(DAY, i.DateListed, GETUTCDATE()) AS DaysListed,
        CASE
            WHEN DATEDIFF(DAY, i.DateListed, GETUTCDATE()) <  30 THEN 'Fresh'
            WHEN DATEDIFF(DAY, i.DateListed, GETUTCDATE()) <  60 THEN 'Aging'
            WHEN DATEDIFF(DAY, i.DateListed, GETUTCDATE()) <  90 THEN 'Stale'
            ELSE 'DeadStock'
        END AS AgeBand
    FROM  [InventoryItems] i
    INNER JOIN [Categories] c ON i.CategoryId = c.Id
    LEFT  JOIN [Suppliers]  s ON i.SupplierId  = s.Id
    WHERE i.Status = 'Active'
    ORDER BY DaysListed DESC;
END
