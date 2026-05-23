CREATE OR ALTER PROCEDURE [dbo].[usp_Platforms_GetAll]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Name, FeePercentage, FixedFee, DefaultPostage, IsActive, CreatedAt
    FROM [Platforms]
    WHERE IsActive = 1
    ORDER BY Name ASC;
END
