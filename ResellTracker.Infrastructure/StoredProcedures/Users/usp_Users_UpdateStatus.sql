CREATE OR ALTER PROCEDURE [dbo].[usp_Users_UpdateStatus]
    @Id     UNIQUEIDENTIFIER,
    @Status NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [Users] SET Status = @Status WHERE Id = @Id;
END
