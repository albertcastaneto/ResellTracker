CREATE OR ALTER PROCEDURE [dbo].[usp_AuditLog_Insert]
    @Id         UNIQUEIDENTIFIER,
    @UserId     UNIQUEIDENTIFIER = NULL,
    @UserEmail  NVARCHAR(255),
    @Action     NVARCHAR(100),
    @EntityName NVARCHAR(100),
    @EntityId   NVARCHAR(100),
    @OldValues  NVARCHAR(MAX) = NULL,
    @NewValues  NVARCHAR(MAX) = NULL,
    @IpAddress  NVARCHAR(45)  = NULL,
    @CreatedAt  DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [AuditLogs] (Id, UserId, UserEmail, Action, EntityName, EntityId, OldValues, NewValues, IpAddress, CreatedAt)
    VALUES (@Id, @UserId, @UserEmail, @Action, @EntityName, @EntityId, @OldValues, @NewValues, @IpAddress, @CreatedAt);
END
