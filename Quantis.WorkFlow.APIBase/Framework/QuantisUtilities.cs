using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace Quantis.WorkFlow.APIBase.Framework
{
    public static class QuantisUtilities
    {
        public static Tuple<string, string> FixHttpURLForCall(string basePath, string apiPath)
        {
            if (Regex.Matches(basePath, "/").Count > 2)
            {
                var index = basePath.LastIndexOf('/');
                var newbasepath = basePath.Substring(0, index);
                var subpath = basePath.Substring(index);
                basePath = newbasepath;
                apiPath = subpath + apiPath;
            }
            return new Tuple<string, string>(basePath, apiPath);
        }
    }
}
