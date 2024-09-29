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
