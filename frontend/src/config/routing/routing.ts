export const Routes = {
	dashboard: {
		path: "/dashboard",
		children: {
			notes: {
				path: "/dashboard/notes",
				params: {
					getWithParams: (params: { id: string | number }) => `/dashboard/notes/${params.id}`,
					$id: "/dashboard/notes/$id"
				}
			},
			nodes: {
				path: "/dashboard/nodes",
				params: {
					getWithParams: (params: { id: string | number }) => `/dashboard/nodes/${params.id}`,
					$id: "/dashboard/nodes/$id"
				}
			},
			settings: {
				path: "/dashboard/settings"
			}
		}
	},
	login: {
		path: "/login"
	},
	shared: {
		path: "/shared",
		params: {
			getWithParams: (params: { sharingUrl: string }) => `/shared/${params.sharingUrl}`,
			$sharingUrl: "/shared/$sharingUrl"
		}
	}
} as const;
