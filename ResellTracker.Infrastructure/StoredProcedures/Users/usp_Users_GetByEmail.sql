CREATE OR ALTER PROCEDURE [dbo].[usp_Users_GetByEmail]
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Email, DisplayName, Role, Status, LastLogin, CreatedAt
    FROM [Users]
    WHERE Email = @Email;
END
