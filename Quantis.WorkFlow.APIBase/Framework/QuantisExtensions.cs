using Quantis.WorkFlow.Services.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Linq.Dynamic.Core;
namespace Quantis.WorkFlow.APIBase.Framework
{
    public static class QuantisExtensions
    {
        public static PagedList<T> GetPaged<T>(this IQueryable<T> query,
                                         PagingInfo pagingInfo) where T : class
        {
            var CurrentPage = pagingInfo.Index;
            var PageSize = pagingInfo.Size;
            var RowCount = query.Count();
            var skip = (pagingInfo.Index - 1) * pagingInfo.Size;
            if (pagingInfo.OrderDirection == OrderDirection.Desc)
            {
                var results = query.OrderBy(pagingInfo.OrderBy+" DESC").Skip(skip).Take(pagingInfo.Size).ToList();
                return new PagedList<T>(results, CurrentPage, PageSize, RowCount);
            }
            else
            {
                var results = query.OrderBy(pagingInfo.OrderBy).Skip(skip).Take(pagingInfo.Size).ToList();
                return new PagedList<T>(results, CurrentPage, PageSize, RowCount);
            }
            
        }


    }
}
