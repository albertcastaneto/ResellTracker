CREATE OR ALTER PROCEDURE [dbo].[usp_Inventory_GetAll]
    @Status     NVARCHAR(50)      = NULL,
    @CategoryId UNIQUEIDENTIFIER  = NULL,
    @SupplierId UNIQUEIDENTIFIER  = NULL,
    @PlatformId UNIQUEIDENTIFIER  = NULL,
    @Search     NVARCHAR(200)     = NULL
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
    WHERE (@Status     IS NULL OR i.Status     = @Status)
      AND (@CategoryId IS NULL OR i.CategoryId = @CategoryId)
      AND (@SupplierId IS NULL OR i.SupplierId = @SupplierId)
      AND (@PlatformId IS NULL OR i.PlatformId = @PlatformId)
      AND (@Search     IS NULL OR i.SKU   LIKE '%' + @Search + '%'
                               OR i.Brand LIKE '%' + @Search + '%')
    ORDER BY i.CreatedAt DESC;
END
