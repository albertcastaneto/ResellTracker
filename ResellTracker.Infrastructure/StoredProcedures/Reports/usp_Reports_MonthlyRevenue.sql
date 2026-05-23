CREATE OR ALTER PROCEDURE [dbo].[usp_Reports_MonthlyRevenue]
    @Months INT = 12
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        YEAR(DateSold)              AS Year,
        MONTH(DateSold)             AS Month,
        DATENAME(MONTH, DateSold)   AS MonthName,
        SUM(SalePrice)              AS TotalRevenue,
        SUM(NetProfit)              AS TotalProfit,
        COUNT(*)                    AS TotalItemsSold
    FROM [SaleLogs]
    WHERE DateSold >= DATEADD(MONTH, -@Months, GETUTCDATE())
    GROUP BY YEAR(DateSold), MONTH(DateSold), DATENAME(MONTH, DateSold)
    ORDER BY Year DESC, Month DESC;
END
