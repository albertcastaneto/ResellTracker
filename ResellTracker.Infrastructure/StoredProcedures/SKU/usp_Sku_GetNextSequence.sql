CREATE OR ALTER PROCEDURE [dbo].[usp_Sku_GetNextSequence]
    @BrandCode    NVARCHAR(10),
    @CategoryCode NVARCHAR(10),
    @SupplierCode NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ISNULL(MAX(SequenceNumber), 0) + 1 AS NextSequence
    FROM [SkuRegistry]
    WHERE BrandCode    = @BrandCode
      AND CategoryCode = @CategoryCode
      AND SupplierCode = @SupplierCode;
END
