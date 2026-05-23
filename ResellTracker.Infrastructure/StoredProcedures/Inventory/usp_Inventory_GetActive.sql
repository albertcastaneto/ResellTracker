CREATE OR ALTER PROCEDURE [dbo].[usp_Inventory_GetActive]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        i.Id, i.SKU, i.Brand, i.CategoryId, i.Size, i.Cogs,
        i.SupplierId, i.PlatformId, i.DateListed, i.Status, i.CreatedAt,
        c.Name  AS CategoryName,
        s.Name  AS SupplierName,
        p.Name  AS PlatformName
    FROM  [InventoryItems] i
    INNER JOIN [Categories] c ON i.CategoryId = c.Id
    LEFT  JOIN [Suppliers]  s ON i.SupplierId  = s.Id
    LEFT  JOIN [Platforms]  p ON i.PlatformId  = p.Id
    WHERE i.Status = 'Active'
    ORDER BY i.DateListed DESC;
END
