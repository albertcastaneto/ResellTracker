CREATE OR ALTER PROCEDURE [dbo].[usp_SalesLog_GetAll]
    @PlatformId UNIQUEIDENTIFIER = NULL,
    @CategoryId UNIQUEIDENTIFIER = NULL,
    @FromDate   DATETIME2        = NULL,
    @ToDate     DATETIME2        = NULL
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
    INNER JOIN [Platforms]     p  ON sl.PlatformId  = p.Id
    INNER JOIN [InventoryItems] i ON sl.InventoryId = i.Id
    INNER JOIN [Categories]    c  ON i.CategoryId   = c.Id
    WHERE (@PlatformId IS NULL OR sl.PlatformId = @PlatformId)
      AND (@CategoryId IS NULL OR i.CategoryId  = @CategoryId)
      AND (@FromDate   IS NULL OR sl.DateSold   >= @FromDate)
      AND (@ToDate     IS NULL OR sl.DateSold   <= @ToDate)
    ORDER BY sl.DateSold DESC;
END
