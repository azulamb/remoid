interface DeviceProps {
	Build: {
		BRAND: string;
	};
	//agui
	build: {
		version: {
			extensions: {
				r: number;
			};
		};
	};
	cache_key: {
		bluetooth: {
			get_bond_state: number;
			get_profile_connection_state: number;
			get_state: number;
			is_offloaded_filtering_supported: number;
		};
		display_info: number;
		has_system_feature: number;
		is_compat_change_enabled: number;
		is_interactive: number;
		is_power_save_mode: number;
		is_user_unlocked: number;
		location_enabled: number;
		package_info: number;
		telephony: {
			get_active_data_sub_id: number;
			get_default_data_sub_id: number;
			get_default_sms_sub_id: number;
			get_default_sub_id: number;
			get_slot_index: number;
		};
	};
	camera: {
		disable_zsl_mode: number;
	};
	//dalvik
	//debug
	//dev
	drm: {
		service: {
			enabled: boolean;
		};
	};
	//gsm,
	hwservicemanager: {
		ready: boolean;
	};
	//init
	log: {
		tag: {
			APM_AudioPolicyManager: string; // TODO: D
			stats_log: string; // TODO: I
		};
	};
	//media
	//mediatek
	//net
	nfc: {
		firmware_version: string;
		initialized: boolean;
	};
	//persist
	//pm
	//qemu
	//ril
	ro: {
		LED_COLOR_TEST: string;
		a61_smartkey_config: string;
		actionable_compatible_property: {
			enabled: boolean;
		};
		adb: {
			secure: number;
		};
		//agui
		//agui_a61_shortkey
		//agui_mobile_data_sim1
		//agui_mobile_data_sim2
		//agui_send_uart
		//agui_shortcut_keycode
		//agui_tee
		//allow
		//alsps_stdvalue
		//apex
		audio: {
			silent: number;
			usb: {
				period_us: number;
			};
		};
		base_build: string;
		baseband: string;
		battery_charging_led: string;
		board: {
			platform: string;
		};
		//boot
		bootimage: {
			build: {
				date: {
					utc: number;
				};
				fingerprint: string;
			};
		};
		bootloader: string;
		bootmode: string;
		build: {
			bluetooth: {
				name: string;
			};
			characteristics: string;
			date: {
				utc: number;
			};
			description: string;
			display: {
				id: string;
			};
			fingerprint: string;
			flavor: string;
			host: string;
			id: string;
			product: string;
			staticwp: string;
			system_root_image: boolean;
			tags: string;
			type: string;
			user: string;
			version: {
				all_codenames: string;
				base_os: string;
				codename: string;
				incremental: string;
				min_supported_target_sdk: number;
				preview_sdk: number;
				preview_sdk_fingerprint: string;
				release: number;
				release_or_codename: number;
				sdk: number;
				security_patch: string;
			};
			wifi: {
				ssid: string;
			};
			wifip2pDN: string;
		};
		//calls
		cam: {
			test: {
				flash: {
					support: string;
				};
			};
		};
		camera: {
			sound: {
				forced: number;
			};
		};
		carrier: string;
		com: {
			google: {
				acsa: boolean;
				clientidbase: string;
				gmsversion: string;
			};
		};
		config: {
			alarm_alert: string;
			alarm_vol_default: number;
			bt_sco_vol_default: number;
			dtmf_vol_default: number;
			media_vol_default: number;
			notifi_vol_default: number;
			notification_sound: string;
			per_app_memcg: boolean;
			ring_vol_default: number;
			ringtone: string;
			ringtone_sim2: string;
			sysenforce_vol_default: number;
			system_vol_default: number;
			tts_vol_default: number;
			vc_call_vol_default: number;
			wallpaper: string;
		};
		control_privapp_permissions: string;
		crypto: {
			state: string;
			type: string;
			uses_fs_ioc_add_encryption_key: boolean;
			volume: {
				filenames_mode: string;
			};
		};
		//dalvik
		debuggable: number;
		def: {
			camera: {
				ais: string;
				water: string;
				zsd: {
					main: string;
					sub: string;
				};
			};
		};
		def_camera_mirror: string;
		default: {
			fontsize: number;
		};
		default_battery_percentage: string;
		dual: {
			mic: {
				support: string;
			};
		};
		faceunlock: {
			fill_light: number;
			min_light: number;
			show_fill_light_screen: number;
			support: number;
		};
		folder: {
			scaling: {
				size: number;
			};
		};
		fota: {
			app: number;
			battery: number;
			device: string;
			gms: number;
			oem: string;
			platform: string;
			type: string;
			version: string;
		};
		frp: {
			pst: string;
		};
		hardware: {
			egl: string;
			gatekeeper: string;
		};
		hwui: {
			use_vulkan: string;
		};
		incoming_ledcolor: string;
		iorapd: {
			enable: boolean;
		};
		is: {
			agui: {
				project: string;
			};
		};
		kernel: {
			zio: number[];
		};
		lmk: {
			downgrade_pressure: number;
			kill_timeout_ms: number;
			psi_complete_stall_ms: number;
			swap_free_low_percentage: number;
		};
		logd: {
			kernel: boolean;
			size: {
				stats: string;
			};
		};
		low_battery_led: string;
		mediatek: {
			rsc_name: string;
			version: {
				branch: string;
			};
			wlan: {
				p2p: number;
				wsc: number;
			};
		};
		miss_call_ledcolor: string;
		//mtk_perf_fast_start_win
		//mtk_perf_response_time
		//mtk_perf_simple_start_win
		nfc_default_on: string;
		odm: {
			build: {
				date: {
					utc: number;
				};
				fingerprint: string;
				version: {
					incremental: string;
				};
			};
		};
		oem_unlock_supported: number;
		opa: {
			eligible_device: boolean;
		};
		opengles: {
			version: number;
		};
		organization_owned: boolean;
		other_notifi_ledcolor: string;
		postinstall: {
			fstab: {
				prefix: string;
			};
		};
		product: {
			board: string;
			brand: string;
			build: {
				date: {
					utc: number;
				};
				fingerprint: string;
				id: string;
				tags: string;
				type: string;
				version: {
					incremental: string;
					release: number;
					release_or_codename: number;
					sdk: number;
				};
			};
			cpu: {
				abi: string;
				abilist: string[];
				abilist32: string[];
				abilist64: string;
			};
			device: string;
			first_api_level: number;
			locale: string;
			manufacturer: string;
			model: string;
			name: string;
			odm: {
				brand: string;
				device: string;
				manufacturer: string;
				model: string;
				name: string;
			};
			product: {
				brand: string;
				device: string;
				manufacturer: string;
				model: string;
				name: string;
			};
			property_source_order: string[];
			system: {
				brand: string;
				device: string;
				manufacturer: string;
				model: string;
				name: string;
			};
			system_ext: {
				brand: string;
				device: string;
				manufacturer: string;
				model: string;
				name: string;
			};
			vendor: {
				brand: string;
				device: string;
				manufacturer: string;
				model: string;
				name: string;
			};
			vndk: {
				version: number;
			};
		};
		property_service: {
			version: number;
		};
		remove: {
			qsb: {
				in: {
					launcher: string;
				};
			};
		};
		revision: number;
		screenoff: {
			timout: number;
		};
		scridle_ledcolor: string;
		secure: number;
		serialno: string;
		setupwizard: {
			rotation_locked: boolean;
		};
		sf: {
			lcd_density: number;
		};
		smartpa: {
			calib: string;
		};
		surface_flinger: {
			force_hwc_copy_for_virtual_displays: boolean;
			max_frame_buffer_acquired_buffers: number;
			primary_display_orientation: string;
			vsync_event_phase_offset_ns: number;
			vsync_sf_event_phase_offset_ns: number;
		};
		sys: {
			usb: {
				bicr: string;
				charging: {
					only: string;
				};
				mtp: {
					whql: {
						enable: number;
					};
				};
				storage: {
					type: string;
				};
			};
		};
		system: {
			build: {
				date: {
					utc: number;
				};
				fingerprint: string;
				id: string;
				tags: string;
				type: string;
				version: {
					incremental: string;
					release: number;
					release_or_codename: number;
					sdk: number;
				};
			};
		};
		system_ext: {
			build: {
				date: {
					utc: number;
				};
				fingerprint: string;
				id: string;
				tags: string;
				type: string;
				version: {
					incremental: string;
					release: number;
					release_or_codename: number;
					sdk: number;
				};
			};
		};
		telephony: {
			default_network: number[];
			iwlan_operation_mode: string;
			sim: {
				count: number;
			};
		};
		//test
		touch: {
			sound: string;
		};
		treble: {
			enabled: boolean;
		};
		unread_notifi_ledcolor: string;
		vendor: {
			app_resolution_tuner: number;
			build: {
				date: {
					utc: number;
				};
				fingerprint: string;
				security_patch: string;
				version: {
					incremental: string;
				};
			};
			faceunlock: {
				support: number;
			};
			have_aee_feature: number;
			init: {
				sensor: {
					rc: string;
				};
			};
			md_apps: {
				load_date: string;
				load_gencfg: string;
				load_type: string;
				load_verno: string;
				support: number;
			};
			md_auto_setup_ims: number;
			md_mims_support: number;
			md_prop_ver: number;
			mediatek: {
				platform: string;
				version: {
					branch: string;
					release: string;
				};
			};
			mtk: {
				bt_sap_enable: boolean;
			};
			mtk_aal_support: number;
			mtk_agps_app: number;
			mtk_audio_alac_support: number;
			mtk_audio_ape_support: number;
			mtk_besloudness_support: number;
			mtk_blulight_def_support: number;
			mtk_c2k_lte_mode: number;
			mtk_c2k_support: number;
			mtk_camera_app_version: number;
			mtk_config_max_dram_size: number;
			mtk_eccci_c2k: number;
			mtk_emmc_support: number;
			mtk_exchange_support: number;
			mtk_external_sim_only_slots: number;
			mtk_fd_support: number;
			mtk_flv_playback_support: number;
			mtk_gps_support: number;
			mtk_log_hide_gps: number;
			mtk_lte_support: number;
			mtk_md1_support: number;
			mtk_md_world_mode_support: number;
			mtk_miravision_support: number;
			mtk_modem_monitor_support: number;
			mtk_nn_quant_preferred: number;
			mtk_omacp_support: number;
			mtk_pq_color_mode: number;
			mtk_pq_support: number;
			mtk_protocol1_rat_config: string;
			mtk_ps1_rat: string;
			mtk_ril_mode: string;
			mtk_single_bin_modem_support: number;
			mtk_slow_motion_support: number;
			mtk_telephony_add_on_policy: number;
			mtk_trustkernel_tee_support: number;
			mtk_uicc_clf: number;
			mtk_wapi_support: number;
			mtk_wappush_support: number;
			mtk_wfd_support: number;
			mtk_zsdhdr_support: number;
			mtklog_internal: number;
			num_md_protocol: number;
			pref_scale_enable_cfg: number;
			sim_me_lock_mode: number;
			sys: {
				current_rsc_path: string;
			};
			vnd: {
				current_rsc_path: string;
			};
			wifi: {
				sap: {
					interface: string;
				};
			};
		};
		vndk: {
			version: number;
		};
		wifi: {
			channels: string;
		};
		zygote: {
			preload: {
				enable: number;
			};
		};
	};
	//security
	selinux: {
		restorecon_recursive: string;
	};
	//service
	setupwizard: {
		theme: string;
	};
	sys: {
		boot: {
			reason: string[];
		};
		boot_completed: number;
		bootstat: {
			first_boot_completed: number;
		};
		init: {
			perf_lsm_hooks: number;
		};
		ipo: {
			disable: number;
			pwrdncap: number;
		};
		isolated_storage_snapshot: boolean;
		oem_unlock_allowed: number;
		rescue_boot_count: number;
		retaildemo: {
			enabled: number;
		};
		rss_hwm_reset: {
			on: number;
		};
		sysctl: {
			extra_free_kbytes: number;
			tcp_def_init_rwnd: number;
		};
		system_server: {
			start_count: number;
			start_elapsed: number;
			start_uptime: number;
		};
		usb: {
			config: string;
			configfs: number;
			controller: string;
			ffs: {
				ready: number;
			};
			state: string;
		};
		use_memfd: boolean;
		user: {
			0: {
				ce_available: boolean;
			};
		};
	};
	telephony: {
		active_modems: {
			max_count: number;
		};
		lteOnCdmaDevice: number;
	};
	//vendor
	//vold
	wifi: {
		concurrent: {
			interface: string;
		};
		direct: {
			interface: string;
		};
		interface: string;
	};
	[keys: string]: any;
}
