CREATE OR ALTER PROCEDURE [dbo].[usp_Suppliers_GetAll]
    @IsActive BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Name, Type, Location, Notes, IsActive, CreatedAt
    FROM [Suppliers]
    WHERE @IsActive IS NULL OR IsActive = @IsActive
    ORDER BY Name ASC;
END
