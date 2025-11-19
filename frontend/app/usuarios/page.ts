"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { CgMenuRound } from "react-icons/cg";
import CryptoJS from "crypto-js";
import staticProfile from "./staticProfile.json";

const AES_SECRET_KEY = "3d9c1b79641bb1355b25a38a3f98487fccb3bd59c2692c56de1a464694feaa85";

function Sidebar(): React.ReactElement {
	const [isOpen, setOpen] = useState(false);

	useEffect(() => {
		const handleClickOutside = (event: any) => {
			if (isOpen && !event.target.closest(".sidebar")) setOpen(false);
		};

		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [isOpen]);

	const h = React.createElement;

	// Mobile menu button
	const mobileButton = h(
		"button",
		{
			className: "p-4 md:hidden fixed z-50 left-4 top-4 bg-black/40 rounded-full",
			onClick: () => setOpen(!isOpen),
			"aria-label": "Abrir menú",
		},
		h(CgMenuRound, { className: "text-3xl text-white" })
	);

	const mobileAside = h(
		"aside",
		{
			className:
				`fixed top-0 left-0 h-full w-64 p-6 text-white transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 bg-gradient-to-b from-[#556b2f] to-[#2f5236] shadow-lg z-40 md:hidden`,
		},
		h("div", { className: "mb-8" },
			h("div", { className: "w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4" }, "N"),
			h("h3", { className: "text-lg font-semibold" }, "NousFit")
		),
		h("nav", { className: "space-y-4" },
			h("a", { href: "/dashboard", className: "block px-3 py-2 rounded-md hover:underline" }, "Estadísticas"),
			h("a", { href: "/usuarios", className: "block px-3 py-2 rounded-md hover:underline" }, "Mi Perfil"),
			h("a", { href: "/login", className: "block px-3 py-2 rounded-md hover:underline" }, "Salir")
		)
	);

	const desktopAside = h(
		"aside",
		{ className: "hidden md:block w-64 bg-[#132f1e] text-white min-h-screen p-6 sticky top-0" },
		h("div", { className: "mb-8" },
			h("div", { className: "w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4" }, "N"),
			h("h3", { className: "text-lg font-semibold" }, "NousFit")
		),
		h("nav", { className: "space-y-3 mt-6" },
			h("a", { href: "/dashboard", className: "block px-3 py-2 rounded-md bg-[#183822] hover:bg-[#19472f]" }, "Estadísticas"),
			h("a", { href: "/usuarios", className: "block px-3 py-2 rounded-md bg-[#183822] text-[#e6f7ee]" }, "Mi Perfil"),
			h("a", { href: "/login", className: "block px-3 py-2 rounded-md hover:bg-[#19472f]" }, "Salir")
		)
	);

	return h(React.Fragment, null, mobileButton, mobileAside, desktopAside);
}

export default function UsuarioPage(): React.ReactElement {
	const [usuario, setUsuario] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState<any>({});
	const [profileFile, setProfileFile] = useState<File | null>(null);
	const [profilePreview, setProfilePreview] = useState<string | null>(null);
	const [profileUploadStatus, setProfileUploadStatus] = useState("");
	const [passwordStatus, setPasswordStatus] = useState("");
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [biometricPreview, setBiometricPreview] = useState<string | null>(null);
	const [biometricFile, setBiometricFile] = useState<File | null>(null);
	const [biometricStatus, setBiometricStatus] = useState("");
	const [darkMode, setDarkMode] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		async function load() {
			try {
				const res = await axios.get("/api/auth/register");
				const u = res.data.usuario || res.data || null;
				setUsuario(u);
				setForm(u || {});
			} catch (err) {
				console.warn("API auth/register no disponible, usando perfil estático.", err);
				setUsuario(staticProfile);
				setForm(staticProfile);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	useEffect(() => {
		try {
			const stored = localStorage.getItem("darkMode");
			if (stored === "true") setDarkMode(true);
		} catch (e) {}
	}, []);

	useEffect(() => {
		try {
			if (darkMode) document.documentElement.classList.add("dark");
			else document.documentElement.classList.remove("dark");
			localStorage.setItem("darkMode", darkMode ? "true" : "false");
		} catch (e) {}
	}, [darkMode]);

	const encryptImage = (imageBase64: string) => CryptoJS.AES.encrypt(imageBase64, AES_SECRET_KEY).toString();

	const handleInput = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSave = async () => {
		try {
			await axios.post("/api/auth/register", form);
			setUsuario(form);
			setEditing(false);
		} catch (err) {
			console.error("Error al guardar usuario:", err);
			alert("Error al guardar");
		}
	};

	const handleProfileChange = (e: any) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setProfileFile(file);
		const reader = new FileReader();
		reader.onload = () => setProfilePreview(reader.result as string);
		reader.readAsDataURL(file);
	};

	const handleSaveProfile = async () => {
		if (!profileFile || !usuario) return setProfileUploadStatus("Selecciona una imagen primero");
		const fm = new FormData();
		fm.append("profile", profileFile);
		fm.append("correo", usuario.correo);

		try {
			const res = await axios.post("/api/auth/uploadProfilePhoto", fm, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			setProfileUploadStatus(res.data.message || "Guardado");
			if (res.data.url) setUsuario({ ...usuario, fotoPerfil: res.data.url });
		} catch (err) {
			console.error(err);
			setProfileUploadStatus("Error al guardar la foto de perfil");
		}
	};

	if (loading) return React.createElement("div", { className: "p-8" }, "Cargando usuario...");

	const triggerFileInput = () => {
		if (fileInputRef.current) fileInputRef.current.click();
	};

	const h = React.createElement;

	// Profile header block
	const profileHeader = h(
		"div",
		{ className: "relative bg-white rounded-lg shadow p-8 mb-6" },
		h("div", { className: "flex flex-col items-center" },
			h("div", { className: "relative" },
				profilePreview
					? h("div", { className: "flex flex-col items-center" },
							h("img", { src: profilePreview, alt: "preview", className: "w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow" }),
							h("div", { className: "mt-3 flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto" },
								h("button", { onClick: handleSaveProfile, className: "w-full md:w-auto px-3 py-2 bg-[#183822] text-white rounded" }, "Guardar foto"),
								h("button", { onClick: () => { setProfilePreview(null); setProfileFile(null); setProfileUploadStatus(''); }, className: "w-full md:w-auto px-3 py-2 bg-white text-[#183822] border rounded" }, "Cancelar"),
							),
							profileUploadStatus ? h("div", { className: "mt-2 text-sm text-gray-600" }, profileUploadStatus) : null
						)
					: h(React.Fragment, null,
							h("img", { src: usuario.fotoPerfil || '/images/profile-sample.jpg', alt: "Foto", className: "w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow" }),
							h("button", { onClick: triggerFileInput, className: "absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md ring-4 ring-[#8b5cf6] ring-offset-2 ring-offset-white hover:scale-105 transition-transform" },
								h("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-[#3f3f46]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" },
									h("path", { d: "M12 20h9" }),
									h("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" })
								)
							),
							h("input", { ref: fileInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handleProfileChange })
						)
			),
			h("h1", { className: "mt-4 text-2xl font-bold text-gray-800" }, usuario.nombre),
			h("p", { className: "text-sm text-gray-500 mt-1" }, usuario.noCuenta || usuario.correo)
		)
	);

	// Left column content
	const leftColumn = h(
		"div",
		{ className: "bg-white rounded-lg shadow p-6" },
		h("h3", { className: "text-lg font-semibold mb-4" }, "Información básica"),
		h("div", { className: "divide-y" },
			h("div", { className: "py-3 flex justify-between" }, h("span", { className: "text-sm text-gray-600" }, "Nombre completo"), h("span", { className: "text-sm text-gray-800" }, usuario.nombre)),
			h("div", { className: "py-3 flex justify-between" }, h("span", { className: "text-sm text-gray-600" }, "Dirección de correo electrónico"), h("span", { className: "text-sm text-gray-800" }, usuario.correo)),
			h("div", { className: "py-3 flex justify-between" }, h("span", { className: "text-sm text-gray-600" }, "ID de alumno"), h("span", { className: "text-sm text-gray-800" }, usuario.noCuenta)),
			h("div", { className: "py-3 flex justify-between" }, h("span", { className: "text-sm text-gray-600" }, "Carrera"), h("span", { className: "text-sm text-gray-800" }, usuario.carrera)),
			h("div", { className: "py-3 flex justify-between" }, h("span", { className: "text-sm text-gray-600" }, "Género"), h("span", { className: "text-sm text-gray-800" }, usuario.genero))
		),

		// Cambiar contraseña
		h("div", { className: "mt-6" },
			h("div", { className: "font-medium flex items-center justify-between" }, "Cambiar contraseña"),
			h("div", { className: "mt-3 space-y-2" },
				h("button", { onClick: () => setShowPasswordForm((s) => !s), className: "text-sm px-2 py-1 bg-[#e6f7ee] text-[#1f4b2e] rounded" }, showPasswordForm ? 'Cerrar' : 'Abrir'),
				showPasswordForm
					? h("div", { className: "mt-3 space-y-2" },
							h("input", { type: "password", name: "oldPassword", value: oldPassword, onChange: (e: any) => setOldPassword(e.target.value), placeholder: "Contraseña actual", className: "w-full px-3 py-2 border rounded" }),
							h("input", { type: "password", name: "newPassword", value: newPassword, onChange: (e: any) => setNewPassword(e.target.value), placeholder: "Nueva contraseña", className: "w-full px-3 py-2 border rounded" }),
							h("input", { type: "password", name: "confirmPassword", value: confirmPassword, onChange: (e: any) => setConfirmPassword(e.target.value), placeholder: "Confirmar nueva contraseña", className: "w-full px-3 py-2 border rounded" }),
							h("div", { className: "flex items-center gap-3" },
								h("button", { onClick: async () => {
										setPasswordStatus("");
										if (!oldPassword || !newPassword) return setPasswordStatus("Rellena los campos");
										if (newPassword !== confirmPassword) return setPasswordStatus("Las contraseñas no coinciden");
										try {
											const payload = { correo: usuario.correo, oldPassword, newPassword };
											const res = await axios.post('/api/auth/changePassword', payload);
											setPasswordStatus(res.data.message || 'OK');
											setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setShowPasswordForm(false);
										} catch (err) {
											console.error(err);
											setPasswordStatus('Error al cambiar contraseña');
										}
									}, className: "px-3 py-2 bg-[#6d28d9] text-white rounded hover:opacity-95" }, "Confirmar cambio"),
								passwordStatus ? h("div", { className: "text-sm text-gray-600" }, passwordStatus) : null
							)
						) : null
			)
		),

		// Datos biométricos
		h("div", { className: "mt-6" },
			h("div", { className: "font-medium" }, "Datos biométricos"),
			h("div", { className: "mt-3 space-y-2" },
				h("div", { className: "flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto" },
					h("input", {
						id: "biometric-input-left",
						type: "file",
						accept: "image/*",
						onChange: (e: any) => {
							const file = e.target.files?.[0];
							if (!file) return;
							setBiometricFile(file);
							const reader = new FileReader();
							reader.onload = () => setBiometricPreview(reader.result as string);
							reader.readAsDataURL(file);
						}
					}),
					biometricPreview
						? h(React.Fragment, null,
								h("button", { onClick: async () => {
										setBiometricStatus('');
										if (!biometricPreview || !usuario) return setBiometricStatus('Selecciona una imagen');
										try {
											const base64 = biometricPreview.split(',')[1];
											const encrypted = encryptImage(base64);
											const fm = new FormData();
											fm.append('imagen', encrypted);
											fm.append('correo', usuario.correo);
											const res = await axios.post('/api/auth/uploadBiometric', fm, { headers: { 'Content-Type': 'multipart/form-data' } });
											setBiometricStatus(res.data.message || 'Guardado');
											setBiometricFile(null); setBiometricPreview(null);
										} catch (err) {
											console.error(err);
											setBiometricStatus('Error al subir datos biométricos');
										}
									}, className: "w-full md:w-auto px-3 py-2 bg-[#183822] text-white rounded" }, "Guardar datos biométricos"),
								h("button", { onClick: () => { setBiometricPreview(null); setBiometricFile(null); setBiometricStatus(''); }, className: "w-full md:w-auto px-3 py-2 bg-white text-[#183822] border rounded" }, "Cancelar")
							)
						: h("div", { className: "text-sm text-gray-600" }, "Selecciona una imagen para previsualizar")
				),
				biometricPreview ? h("div", { className: "mt-2" }, h("img", { src: biometricPreview, alt: "preview", className: "w-32 h-32 md:w-40 md:h-40 object-cover rounded" })) : null,
				biometricStatus ? h("div", { className: "text-sm text-gray-600" }, biometricStatus) : null
			)
		)
	);

	// Right column (settings)
	const rightColumn = h(
		"div",
		{ className: "bg-white rounded-lg shadow p-6" },
		h("h3", { className: "text-lg font-semibold mb-4" }, "Configuración del sistema"),
		h("div", { className: "text-sm text-gray-700 space-y-4" },
			h("div", null,
				h("div", { className: "font-medium" }, "Modo"),
				h("div", { className: "flex items-center gap-3 mt-2" },
					h("div", { className: "text-gray-600" }, darkMode ? 'Oscuro' : 'Claro'),
					h("button", { onClick: () => setDarkMode((s) => !s), className: `w-12 h-6 rounded-full p-0.5 ${darkMode ? 'bg-[#183822]' : 'bg-gray-300'}`, "aria-pressed": darkMode },
						h("div", { className: `w-5 h-5 bg-white rounded-full transform ${darkMode ? 'translate-x-6' : 'translate-x-0'} transition-transform` })
					)
				)
			),
			h("div", null, h("div", { className: "font-medium" }, "Privacidad"), h("div", { className: "text-gray-600" }, "Solo los administradores pueden ver información sensible")),
			h("div", null, h("a", { href: "#", className: "text-indigo-600 hover:underline" }, "Editar notificaciones"))
		)
	);

	const content = h(
		"div",
		{ className: "min-h-screen bg-[#2f5236] flex" },
		h(Sidebar, null),
		h("main", { className: "flex-1 p-8" },
			h("div", { className: "max-w-5xl mx-auto" },
				profileHeader,
				h("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, leftColumn, rightColumn)
			)
		)
	);

	return content;
}
