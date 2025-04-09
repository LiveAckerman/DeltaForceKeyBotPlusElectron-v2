// 子菜单
export default {
	work: {
		'menu_100' : {
			icon: 'profile',
			title: '配置钥匙卡信息',
			pageName: 'ConfigKeyCardInfo',
			params: {}
		},
		'menu_101' : {
			icon: 'profile',
			title: '配置位置信息',
			pageName: 'ConfigLocationInfo',
			params: {}
		},
		'menu_102' : {
			icon: 'profile',
			title: '执行抢卡任务',
			pageName: 'RunTask',
			params: {}
    },
	},
	framework: {
    'menu_100' : {
			icon: 'profile',
			title: 'sqlite数据库',
			pageName: 'FrameworkSqliteDBIndex',
			params: {}
		},
    'menu_101' : {
			icon: 'profile',
			title: '自动更新',
			pageName: 'FrameworkUpdaterIndex',
			params: {}
		},
	},
}
