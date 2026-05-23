CREATE OR ALTER PROCEDURE [dbo].[usp_SalesLog_Update]
    @Id         UNIQUEIDENTIFIER,
    @SalePrice  DECIMAL(10, 2),
    @PlatformId UNIQUEIDENTIFIER,
    @Postage    DECIMAL(10, 2),
    @DateSold   DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FeePercentage DECIMAL(5,  2);
    DECLARE @FixedFee      DECIMAL(10, 2);
    DECLARE @Cogs          DECIMAL(10, 2);
    DECLARE @InventoryId   UNIQUEIDENTIFIER;
    DECLARE @DateListed    DATETIME2;
    DECLARE @NetProfit     DECIMAL(10, 2);
    DECLARE @DaysToSell    INT;

    SELECT @FeePercentage = FeePercentage, @FixedFee = FixedFee
    FROM [Platforms] WHERE Id = @PlatformId;

    SELECT @InventoryId = InventoryId FROM [SaleLogs] WHERE Id = @Id;

    SELECT @Cogs = Cogs, @DateListed = DateListed
    FROM [InventoryItems] WHERE Id = @InventoryId;

    SET @NetProfit  = @SalePrice - @Cogs - (@SalePrice * @FeePercentage / 100.0) - @FixedFee - @Postage;
    SET @DaysToSell = DATEDIFF(DAY, CAST(@DateListed AS DATE), CAST(@DateSold AS DATE));

    UPDATE [SaleLogs]
    SET SalePrice     = @SalePrice,
        PlatformId    = @PlatformId,
        FeePercentage = @FeePercentage,
        FixedFee      = @FixedFee,
        Postage       = @Postage,
        NetProfit     = @NetProfit,
        DaysToSell    = @DaysToSell,
        DateSold      = @DateSold
    WHERE Id = @Id;
END
