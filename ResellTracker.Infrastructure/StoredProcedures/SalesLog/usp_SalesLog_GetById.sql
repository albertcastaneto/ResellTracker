CREATE OR ALTER PROCEDURE [dbo].[usp_SalesLog_GetById]
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        sl.Id, sl.InventoryId, sl.SKU, sl.SalePrice, sl.PlatformId,
        sl.FeePercentage, sl.FixedFee, sl.Postage, sl.NetProfit,
        sl.DaysToSell, sl.DateSold, sl.CreatedAt,
        p.Name  AS PlatformName,
        i.Brand AS Brand,
        c.Name  AS CategoryName
    FROM  [SaleLogs]      sl
    INNER JOIN [Platforms]      p ON sl.PlatformId  = p.Id
    INNER JOIN [InventoryItems] i ON sl.InventoryId = i.Id
    INNER JOIN [Categories]     c ON i.CategoryId   = c.Id
    WHERE sl.Id = @Id;
END
