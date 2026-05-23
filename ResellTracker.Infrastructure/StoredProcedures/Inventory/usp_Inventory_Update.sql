CREATE OR ALTER PROCEDURE [dbo].[usp_Inventory_Update]
    @Id         UNIQUEIDENTIFIER,
    @SKU        NVARCHAR(50),
    @Brand      NVARCHAR(100),
    @CategoryId UNIQUEIDENTIFIER,
    @Size       NVARCHAR(20),
    @Cogs       DECIMAL(10, 2),
    @SupplierId UNIQUEIDENTIFIER = NULL,
    @PlatformId UNIQUEIDENTIFIER = NULL,
    @DateListed DATETIME2,
    @Status     NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [InventoryItems]
    SET SKU        = @SKU,
        Brand      = @Brand,
        CategoryId = @CategoryId,
        Size       = @Size,
        Cogs       = @Cogs,
        SupplierId = @SupplierId,
        PlatformId = @PlatformId,
        DateListed = @DateListed,
        Status     = @Status
    WHERE Id = @Id;
END
