CREATE OR ALTER PROCEDURE [dbo].[usp_Users_UpdateRole]
    @Id   UNIQUEIDENTIFIER,
    @Role NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [Users] SET Role = @Role WHERE Id = @Id;
END
