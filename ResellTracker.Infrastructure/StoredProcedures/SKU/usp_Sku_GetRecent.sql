CREATE OR ALTER PROCEDURE [dbo].[usp_Sku_GetRecent]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 20 Id, SKU, BrandCode, CategoryCode, SizeCode, SupplierCode, SequenceNumber, InventoryId, CreatedAt
    FROM [SkuRegistry]
    ORDER BY CreatedAt DESC;
END
