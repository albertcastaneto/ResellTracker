CREATE OR ALTER PROCEDURE [dbo].[usp_Sku_Insert]
    @SKU            NVARCHAR(50),
    @BrandCode      NVARCHAR(10),
    @CategoryCode   NVARCHAR(10),
    @SizeCode       NVARCHAR(10),
    @SupplierCode   NVARCHAR(10),
    @SequenceNumber INT,
    @InventoryId    UNIQUEIDENTIFIER = NULL,
    @NewId          UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @NewId = NEWID();
    INSERT INTO [SkuRegistry] (Id, SKU, BrandCode, CategoryCode, SizeCode, SupplierCode, SequenceNumber, InventoryId, CreatedAt)
    VALUES (@NewId, @SKU, @BrandCode, @CategoryCode, @SizeCode, @SupplierCode, @SequenceNumber, @InventoryId, GETUTCDATE());
END
