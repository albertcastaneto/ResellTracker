CREATE OR ALTER PROCEDURE [dbo].[usp_SalesLog_Insert]
    @InventoryId UNIQUEIDENTIFIER,
    @SalePrice   DECIMAL(10, 2),
    @PlatformId  UNIQUEIDENTIFIER,
    @Postage     DECIMAL(10, 2),
    @DateSold    DATETIME2,
    @NewId       UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FeePercentage DECIMAL(5,  2);
    DECLARE @FixedFee      DECIMAL(10, 2);
    DECLARE @Cogs          DECIMAL(10, 2);
    DECLARE @DateListed    DATETIME2;
    DECLARE @SKU           NVARCHAR(50);
    DECLARE @NetProfit     DECIMAL(10, 2);
    DECLARE @DaysToSell    INT;

    SELECT @FeePercentage = FeePercentage, @FixedFee = FixedFee
    FROM [Platforms] WHERE Id = @PlatformId;

    SELECT @Cogs = Cogs, @DateListed = DateListed, @SKU = SKU
    FROM [InventoryItems] WHERE Id = @InventoryId;

    SET @NetProfit  = @SalePrice - @Cogs - (@SalePrice * @FeePercentage / 100.0) - @FixedFee - @Postage;
    SET @DaysToSell = DATEDIFF(DAY, CAST(@DateListed AS DATE), CAST(@DateSold AS DATE));
    SET @NewId      = NEWID();

    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO [SaleLogs] (Id, InventoryId, SKU, SalePrice, PlatformId, FeePercentage, FixedFee, Postage, NetProfit, DaysToSell, DateSold, CreatedAt)
        VALUES (@NewId, @InventoryId, @SKU, @SalePrice, @PlatformId, @FeePercentage, @FixedFee, @Postage, @NetProfit, @DaysToSell, @DateSold, GETUTCDATE());

        UPDATE [InventoryItems] SET Status = 'Sold' WHERE Id = @InventoryId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END
