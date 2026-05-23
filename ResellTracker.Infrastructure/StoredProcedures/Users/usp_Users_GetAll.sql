CREATE OR ALTER PROCEDURE [dbo].[usp_Users_GetAll]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Email, DisplayName, Role, Status, LastLogin, CreatedAt
    FROM [Users]
    ORDER BY DisplayName ASC;
END
