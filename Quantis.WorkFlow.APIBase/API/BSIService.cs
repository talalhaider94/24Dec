using Quantis.WorkFlow.Services.API;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.APIBase.API
{
    public class BSIService: IBSIService
    {
        private string _sessionID = null;
        private BSIAuth.OblicoreAuthSoapClient _authService = null;
        private BSIReports.ReportsSoapClient _reportService = null;
        public BSIService()
        {
            if (_authService == null)
            {
                _authService = new BSIAuth.OblicoreAuthSoapClient(BSIAuth.OblicoreAuthSoapClient.EndpointConfiguration.OblicoreAuthSoap);
            }
            if (_reportService == null)
            {
                _reportService = new BSIReports.ReportsSoapClient(BSIReports.ReportsSoapClient.EndpointConfiguration.ReportsSoap);
            }

        }
        private void Login()
        {
            if (_sessionID != null)
            {
                _authService.ClearSessionContextAsync(_sessionID);
            }
            _sessionID=_authService.CreateSessionContextAsync("samin", "Poste italian").Result;
        }
        private void Logout()
        {
            if (_sessionID != "")
            {
                _authService.ClearSessionContextAsync(_sessionID);
                _sessionID = "";
            }            
        }

        public int Sample()
        {
            Login();
            return 1;
        }
        ~BSIService()
        {
            int x = 1;
        }
    }
}
