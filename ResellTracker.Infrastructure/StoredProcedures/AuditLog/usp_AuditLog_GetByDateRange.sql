CREATE OR ALTER PROCEDURE [dbo].[usp_AuditLog_GetByDateRange]
    @FromDate DATETIME2,
    @ToDate   DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, UserId, UserEmail, Action, EntityName, EntityId, OldValues, NewValues, IpAddress, CreatedAt
    FROM [AuditLogs]
    WHERE CreatedAt >= @FromDate AND CreatedAt <= @ToDate
    ORDER BY CreatedAt DESC;
END
