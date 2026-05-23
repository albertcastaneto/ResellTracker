CREATE OR ALTER PROCEDURE [dbo].[usp_Platforms_GetById]
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Name, FeePercentage, FixedFee, DefaultPostage, IsActive, CreatedAt
    FROM [Platforms]
    WHERE Id = @Id;
END
