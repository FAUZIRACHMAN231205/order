"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
// import { useToast } from "@/components/ui/use-toast"; // DIHAPUS karena gagal resolve
import { motion } from "framer-motion";

// Interface untuk tipe data form yang lebih aman (opsional, tapi disarankan untuk TypeScript)
interface FormData {
    tanggal: Date;
    waktu: string;
    jenisKonsumsi: string;
    keterangan: string;
    jumlah: number | string; 
    lokasi: string;
    pic: string;
    noHp: string;
    unitKerja: string;
}

const initialFormData: FormData = {
    tanggal: new Date(),
    waktu: 'pagi',
    jenisKonsumsi: '',
    keterangan: '',
    jumlah: 10,
    lokasi: '',
    pic: '',
    noHp: '',
    unitKerja: '',
};

export default function PemesananKonsumsiForm() {
    // 🔔 useToast dihapus karena tidak dapat di-resolve. Feedback diganti dengan state internal.

    // State untuk menyimpan semua data dari form dalam satu objek
    const [formData, setFormData] = useState<FormData>(initialFormData);

    // State untuk mengontrol dialog review
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    // State untuk status loading saat submit
    const [isSubmitting, setIsSubmitting] = useState(false);
    // State baru untuk menampilkan pesan sukses setelah submit
    const [isSubmissionSuccessful, setIsSubmissionSuccessful] = useState(false); 


    // Fungsi generik untuk menangani perubahan pada input, textarea, dan select
    const handleChange = (name: keyof FormData, value: any) => {
        // Khusus untuk 'jumlah', pastikan disimpan sebagai integer jika bukan string kosong
        const finalValue = name === 'jumlah' && value !== '' ? parseInt(value, 10) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };
    
    // Fungsi untuk menangani perubahan tanggal
    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setFormData(prev => ({ ...prev, tanggal: date }));
        }
    };

    // Fungsi yang dijalankan saat tombol "Review Pesanan" di-klik
    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Reset success message jika user review ulang
        if (isSubmissionSuccessful) setIsSubmissionSuccessful(false); 

        console.log('Form data for review:', formData);
        setIsReviewOpen(true);
    };

    // Fungsi yang dijalankan saat pesanan dikonfirmasi dari dialog
    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        console.log('Submitting final data:', formData);

        // Simulasi proses pengiriman data ke server
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setIsReviewOpen(false);
        
        // Ganti Toast dengan setting state sukses untuk feedback visual
        setIsSubmissionSuccessful(true);

        // Reset form dan pesan sukses setelah 5 detik
        setTimeout(() => {
            setIsSubmissionSuccessful(false);
            setFormData(initialFormData);
        }, 5000); 
    };

    // Opsi untuk dropdown
    const unitKerjaOptions = [
        "Teknologi Informasi", "Sumber Daya Manusia", "Keuangan", "Pemasaran", "Operasional"
    ];
    const jenisKonsumsiOptions = ["Prasmanan", "Nasi Box", "Snack", "Coffee Break"];
    
    return (
        <div className="bg-slate-950 min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Formulir Pemesanan Konsumsi</CardTitle>
                    <CardDescription>
                        {isSubmissionSuccessful ? (
                            <span className="text-green-600 font-medium">Data pemesanan Anda telah berhasil dikirim!</span>
                        ) : (
                            "Isi detail di bawah ini untuk memesan konsumsi acara Anda."
                        )}
                    </CardDescription>
                </CardHeader>

                {/* Render Success Message atau Form, tergantung state */}
                {isSubmissionSuccessful ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CardContent className="text-center py-10 space-y-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-800">Pemesanan Selesai</h3>
                            <p className="text-gray-600">Permintaan Anda akan segera diproses oleh tim terkait. Anda dapat membuat pesanan baru setelah ini.</p>
                        </CardContent>
                        <CardFooter className="justify-center">
                            <Button onClick={() => { setIsSubmissionSuccessful(false); setFormData(initialFormData); }}>Buat Pesanan Baru</Button>
                        </CardFooter>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <form onSubmit={handleReviewSubmit}>
                            <CardContent className="grid gap-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {/* Tanggal Konsumsi */}
                                    <div className="space-y-2">
                                        <Label htmlFor="tanggal">Tanggal Konsumsi</Label>
                                        <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                            variant={'outline'}
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !formData.tanggal && 'text-muted-foreground'
                                            )}
                                            >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.tanggal ? formData.tanggal.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : <span>Pilih tanggal</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                            mode="single"
                                            selected={formData.tanggal}
                                            onSelect={handleDateChange}
                                            initialFocus
                                            />
                                        </PopoverContent>
                                        </Popover>
                                    </div>
                                    {/* Waktu Konsumsi */}
                                    <div className="space-y-2">
                                        <Label>Waktu Konsumsi</Label>
                                        <RadioGroup
                                            value={formData.waktu}
                                            onValueChange={(value) => handleChange('waktu', value)}
                                            className="flex items-center space-x-4 pt-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="pagi" id="pagi" />
                                                <Label htmlFor="pagi">Pagi</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="siang" id="siang" />
                                                <Label htmlFor="siang">Siang</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="sore" id="sore" />
                                                <Label htmlFor="sore">Sore</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {/* Jenis Konsumsi */}
                                    <div className="space-y-2">
                                        <Label htmlFor="jenisKonsumsi">Jenis Konsumsi</Label>
                                        <Select onValueChange={(value) => handleChange('jenisKonsumsi', value)} value={formData.jenisKonsumsi}>
                                            <SelectTrigger id="jenisKonsumsi">
                                            <SelectValue placeholder="Pilih jenis konsumsi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                            {jenisKonsumsiOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {/* Jumlah */}
                                    <div className="space-y-2">
                                        <Label htmlFor="jumlah">Jumlah (pax)</Label>
                                        <Input id="jumlah" type="number" placeholder="Contoh: 50" value={formData.jumlah} onChange={(e) => handleChange('jumlah', e.target.value)} />
                                    </div>
                                </div>

                                {/* Keterangan/Acara */}
                                <div className="space-y-2">
                                    <Label htmlFor="keterangan">Keterangan / Nama Acara</Label>
                                    <Textarea id="keterangan" placeholder="Contoh: Rapat Koordinasi Bulanan" value={formData.keterangan} onChange={(e) => handleChange('keterangan', e.target.value)} />
                                </div>

                                {/* Lokasi */}
                                <div className="space-y-2">
                                    <Label htmlFor="lokasi">Lokasi / Gedung</Label>
                                    <Input id="lokasi" placeholder="Contoh: Ruang Meeting Anggrek, Lt. 3" value={formData.lokasi} onChange={(e) => handleChange('lokasi', e.target.value)} />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {/* PIC */}
                                    <div className="space-y-2">
                                        <Label htmlFor="pic">Nama PIC (Person in Charge)</Label>
                                        <Input id="pic" placeholder="Masukkan nama lengkap" value={formData.pic} onChange={(e) => handleChange('pic', e.target.value)} />
                                    </div>
                                    {/* No HP PIC */}
                                    <div className="space-y-2">
                                        <Label htmlFor="noHp">No. HP PIC</Label>
                                        <Input id="noHp" placeholder="Contoh: 08123456789" value={formData.noHp} onChange={(e) => handleChange('noHp', e.target.value)} />
                                    </div>
                                </div>
                                
                                {/* Unit Kerja */}
                                <div className="space-y-2">
                                    <Label htmlFor="unitKerja">Unit Kerja</Label>
                                    <Select onValueChange={(value) => handleChange('unitKerja', value)} value={formData.unitKerja}>
                                        <SelectTrigger id="unitKerja">
                                        <SelectValue placeholder="Pilih unit kerja Anda" />
                                        </SelectTrigger>
                                        <SelectContent>
                                        {unitKerjaOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Review Pesanan</Button>
                            </CardFooter>
                        </form>
                    </motion.div>
                )}


            </Card>

            {/* Dialog untuk Review Pesanan */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="sm:max-w-[480px] bg-white text-black z-[9999]">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >

                        <DialogHeader>
                        <DialogTitle>Konfirmasi Detail Pesanan</DialogTitle>
                        <DialogDescription>
                            Mohon periksa kembali detail pesanan Anda sebelum melakukan submit.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right">Tanggal</Label>
                                <span className="col-span-2 font-semibold">{formData.tanggal.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right">Waktu</Label>
                                <span className="col-span-2 font-semibold capitalize">{formData.waktu}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right">Jenis & Jumlah</Label>
                                <span className="col-span-2 font-semibold">{formData.jenisKonsumsi} ({formData.jumlah} pax)</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right">Acara</Label>
                                <span className="col-span-2 font-semibold">{formData.keterangan || "-"}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right">Lokasi</Label>
                                <span className="col-span-2 font-semibold">{formData.lokasi || "-"}</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right">PIC</Label>
                                <span className="col-span-2 font-semibold">{formData.pic} ({formData.noHp})</span>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right">Unit Kerja</Label>
                                <span className="col-span-2 font-semibold">{formData.unitKerja}</span>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Mengirim...' : 'Ya, Konfirmasi & Submit'}
                            </Button>
                        </DialogFooter>
                    </motion.div> 
                </DialogContent>
            </Dialog>
        </div>
    );
}
