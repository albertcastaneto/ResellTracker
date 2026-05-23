CREATE OR ALTER PROCEDURE [dbo].[usp_Inventory_Insert]
    @SKU        NVARCHAR(50),
    @Brand      NVARCHAR(100),
    @CategoryId UNIQUEIDENTIFIER,
    @Size       NVARCHAR(20),
    @Cogs       DECIMAL(10, 2),
    @SupplierId UNIQUEIDENTIFIER = NULL,
    @PlatformId UNIQUEIDENTIFIER = NULL,
    @DateListed DATETIME2,
    @Status     NVARCHAR(50),
    @NewId      UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @NewId = NEWID();
    INSERT INTO [InventoryItems] (Id, SKU, Brand, CategoryId, Size, Cogs, SupplierId, PlatformId, DateListed, Status, CreatedAt)
    VALUES (@NewId, @SKU, @Brand, @CategoryId, @Size, @Cogs, @SupplierId, @PlatformId, @DateListed, @Status, GETUTCDATE());
END
