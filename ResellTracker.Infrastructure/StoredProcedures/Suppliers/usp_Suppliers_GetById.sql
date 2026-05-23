CREATE OR ALTER PROCEDURE [dbo].[usp_Suppliers_GetById]
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Name, Type, Location, Notes, IsActive, CreatedAt
    FROM [Suppliers]
    WHERE Id = @Id;
END
