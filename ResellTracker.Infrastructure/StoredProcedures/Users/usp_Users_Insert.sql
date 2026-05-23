CREATE OR ALTER PROCEDURE [dbo].[usp_Users_Insert]
    @Email       NVARCHAR(255),
    @DisplayName NVARCHAR(100),
    @Role        NVARCHAR(50),
    @Status      NVARCHAR(50),
    @NewId       UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @NewId = NEWID();
    INSERT INTO [Users] (Id, Email, DisplayName, Role, Status, CreatedAt)
    VALUES (@NewId, @Email, @DisplayName, @Role, @Status, GETUTCDATE());
END
