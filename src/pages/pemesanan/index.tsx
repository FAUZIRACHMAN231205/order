"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon, Loader2, PartyPopper, History, ClipboardList, Users, MapPin, CalendarDays, ShoppingBasket, User, ShieldCheck, Trash2, UtensilsCrossed, Info, UserCheck, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { SearchableSelectField } from "@/components/form/searchable-select-field";


// --- Definisi Komponen Badge dimulai di sini ---
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white",
        warning: "border-transparent bg-yellow-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
// --- Definisi Komponen Badge berakhir di sini ---

const formSchema = z.object({
  tanggal: z.date({
    required_error: "Tanggal harus diisi.",
  }),
  waktu: z.string(),
  jenisKonsumsi: z.string().min(1, { message: "Jenis konsumsi harus dipilih." }),
  keterangan: z.string().min(1, { message: "Nama acara harus dipilih." }),
  keteranganLainnya: z.string(),
  jumlah: z.coerce.number().min(1, { message: "Jumlah harus diisi minimal 1." }),
  lokasi: z.string().min(1, { message: "Lokasi harus dipilih." }),
  lokasiLainnya: z.string(),
  pengaju: z.string().min(3, { message: "Nama pengaju harus diisi." }),
  approval: z.string().min(1, { message: "Approval harus dipilih." }),
}).refine(data => !(data.keterangan === 'Lainnya' && !data.keteranganLainnya), {
  message: "Mohon sebutkan nama acara lainnya.",
  path: ["keteranganLainnya"],
}).refine(data => !(data.lokasi === 'Lainnya' && !data.lokasiLainnya), {
  message: "Mohon sebutkan lokasi lainnya.",
  path: ["lokasiLainnya"],
});


type FormData = z.infer<typeof formSchema>;

// Menambahkan ID dan timestamp pada interface
interface Order extends FormData {
    id: string;
    orderTimestamp: string;
    status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';
}

const initialFormData: any = {
    tanggal: new Date(),
    waktu: 'pagi',
    jenisKonsumsi: '',
    keterangan: '',
    keteranganLainnya: '',
    jumlah: '',
    lokasi: '',
    lokasiLainnya: '',
    pengaju: '',
    approval: 'Manajer SDM',
};

export default function PemesananKonsumsiForm() {
    const { toast } = useToast();
    const [riwayatPemesanan, setRiwayatPemesanan] = useState<Order[]>([]);
    const [viewMode, setViewMode] = useState<'form' | 'history'>('form');
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentOrderData, setCurrentOrderData] = useState<FormData | null>(null);
    const [searchTerm, setSearchTerm] = useState("");


    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: initialFormData,
    });

    const watchKeterangan = form.watch("keterangan");
    const watchLokasi = form.watch("lokasi");

    useEffect(() => {
        try {
            const storedRiwayat = localStorage.getItem('riwayatPemesanan');
            if (storedRiwayat) {
                const parsedRiwayat = JSON.parse(storedRiwayat).map((order: any) => ({
                    ...order,
                    tanggal: new Date(order.tanggal),
                    orderTimestamp: new Date(order.orderTimestamp)
                }));
                setRiwayatPemesanan(parsedRiwayat);
            }
        } catch (error) {
            console.error("Gagal memuat riwayat dari localStorage:", error);
        }
    }, []);

    function onSubmit(data: FormData) {
        setCurrentOrderData(data);
        setIsReviewOpen(true);
    }

    const handleFinalSubmit = async () => {
        if (!currentOrderData) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const finalKeterangan = currentOrderData.keterangan === 'Lainnya' ? currentOrderData.keteranganLainnya : currentOrderData.keterangan;
        const finalLokasi = currentOrderData.lokasi === 'Lainnya' ? currentOrderData.lokasiLainnya : currentOrderData.lokasi;

        const newOrder: Order = {
            ...currentOrderData,
            keterangan: finalKeterangan,
            lokasi: finalLokasi,
            id: new Date().toISOString(),
            orderTimestamp: new Date().toISOString(),
            status: 'Menunggu Persetujuan',
        };

        const updatedRiwayat = [newOrder, ...riwayatPemesanan];
        setRiwayatPemesanan(updatedRiwayat);
        try {
            localStorage.setItem('riwayatPemesanan', JSON.stringify(updatedRiwayat));
        } catch (error) {
            console.error("Gagal menyimpan riwayat ke localStorage:", error);
        }

        setIsSubmitting(false);
        setIsReviewOpen(false);
        form.reset(initialFormData as any);
        toast({
            title: "Pemesanan Berhasil!",
            description: "Permintaan konsumsi Anda telah berhasil dicatat.",
            className: "bg-green-500 text-white",
        });
    };
    
    const handleClearHistory = () => {
        setRiwayatPemesanan([]);
        localStorage.removeItem('riwayatPemesanan');
         toast({
            title: "Riwayat Dihapus",
            description: "Semua data riwayat pemesanan telah dihapus.",
        });
    }
    
    const filteredHistory = riwayatPemesanan.filter(order =>
        order.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const jenisKonsumsiOptions = ["Prasmanan", "Nasi Box", "Snack", "Coffee Break"];
    const approvalOptions = ["Manajer SDM", "Manajer Keuangan", "Direktur Operasional"];
    const keteranganOptions = ["Rapat Koordinasi", "Pelatihan Internal", "Acara Departemen", "Lainnya"];
    const lokasiOptions = ["Ruang Rapat Lt. 1", "Auditorium", "Ruang Serbaguna", "Lobi Utama", "Lainnya"];


    return (
        <div className="bg-gradient-to-br from-background to-secondary/30 dark:from-background dark:to-secondary/20 min-h-screen w-full flex items-center justify-center p-2 sm:p-4 font-sans">
          <TooltipProvider>
            <Card className="w-full max-w-2xl shadow-lg overflow-hidden bg-card/80 dark:bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                             <div className="p-3 bg-primary/10 rounded-full">
                                <UtensilsCrossed className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">
                                    {viewMode === 'form' ? 'Pemesanan Konsumsi' : 'Riwayat Pemesanan'}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {viewMode === 'form' ? 'Isi formulir untuk memesan konsumsi.' : 'Lihat daftar pesanan Anda sebelumnya.'}
                                </CardDescription>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" onClick={() => setViewMode(viewMode === 'form' ? 'history' : 'form')} className="shrink-0">
                                    {viewMode === 'form' ? (
                                        <>
                                            <History className="mr-0 sm:mr-2 h-4 w-4" />
                                            <span className="hidden sm:inline">Lihat Riwayat</span>
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardList className="mr-0 sm:mr-2 h-4 w-4" />
                                             <span className="hidden sm:inline">Buat Pesanan</span>
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                               <p>{viewMode === 'form' ? 'Beralih ke tampilan riwayat' : 'Kembali ke formulir pemesanan'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </CardHeader>

                <AnimatePresence mode="wait">
                    {viewMode === 'form' ? (
                        <motion.div 
                            key="form"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Form {...form}>
                                <motion.form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                >
                                    <CardContent className="grid gap-6 p-4 sm:p-6">
                                        {/* --- Section Detail Acara --- */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Info className="h-5 w-5 text-primary"/>
                                                <h3 className="text-lg font-semibold text-primary">Detail Acara & Waktu</h3>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <FormField
                                                  control={form.control}
                                                  name="tanggal"
                                                  render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                      <FormLabel>Tanggal Konsumsi</FormLabel>
                                                      <Popover>
                                                        <PopoverTrigger asChild>
                                                          <FormControl>
                                                            <Button
                                                              variant="outline"
                                                              className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                                            >
                                                              <CalendarIcon className="mr-2 h-4 w-4" />
                                                              {field.value ? field.value.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : <span>Pilih tanggal</span>}
                                                            </Button>
                                                          </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                        </PopoverContent>
                                                      </Popover>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="waktu"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel>Waktu Konsumsi</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                    className="flex items-center space-x-2 sm:space-x-4 pt-2"
                                                                >
                                                                    {['pagi', 'siang', 'sore'].map((waktu) => (
                                                                        <FormItem key={waktu} className="flex items-center space-x-2">
                                                                            <FormControl>
                                                                                <RadioGroupItem value={waktu} id={waktu} />
                                                                            </FormControl>
                                                                            <FormLabel htmlFor={waktu} className="capitalize font-normal">{waktu}</FormLabel>
                                                                        </FormItem>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                             <FormField
                                              control={form.control}
                                              name="keterangan"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Nama Acara</FormLabel>
                                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                      <SelectTrigger><SelectValue placeholder="Pilih jenis acara" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                      {keteranganOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                                    </SelectContent>
                                                  </Select>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                            <AnimatePresence>
                                            {watchKeterangan === 'Lainnya' && (
                                                <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="space-y-2 overflow-hidden">
                                                      <FormField
                                                        control={form.control}
                                                        name="keteranganLainnya"
                                                        render={({ field }) => (
                                                          <FormItem>
                                                            <FormLabel>Sebutkan Nama Acara</FormLabel>
                                                            <FormControl>
                                                              <Input placeholder="Contoh: Perayaan Ulang Tahun Perusahaan" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                          </FormItem>
                                                        )}
                                                      />
                                                </motion.div>
                                            )}
                                            </AnimatePresence>
                                            <FormField
                                              control={form.control}
                                              name="lokasi"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Lokasi / Gedung</FormLabel>
                                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                      <SelectTrigger><SelectValue placeholder="Pilih lokasi acara" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                      {lokasiOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                                    </SelectContent>
                                                  </Select>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                            <AnimatePresence>
                                            {watchLokasi === 'Lainnya' && (
                                                <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="space-y-2 overflow-hidden">
                                                    <FormField
                                                      control={form.control}
                                                      name="lokasiLainnya"
                                                      render={({ field }) => (
                                                        <FormItem>
                                                          <FormLabel>Sebutkan Lokasi</FormLabel>
                                                          <FormControl>
                                                            <Input placeholder="Contoh: Gudang Belakang" {...field} />
                                                          </FormControl>
                                                          <FormMessage />
                                                        </FormItem>
                                                      )}
                                                    />
                                                </motion.div>
                                            )}
                                            </AnimatePresence>
                                        </div>
                                        
                                        <Separator/>

                                        {/* --- Section Detail Konsumsi --- */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <ShoppingBasket className="h-5 w-5 text-primary"/>
                                                <h3 className="text-lg font-semibold text-primary">Detail Konsumsi</h3>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <FormField
                                                  control={form.control}
                                                  name="jenisKonsumsi"
                                                  render={({ field }) => (
                                                    <FormItem>
                                                      <FormLabel>Jenis Konsumsi</FormLabel>
                                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                          <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                          {jenisKonsumsiOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                                        </SelectContent>
                                                      </Select>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                                <FormField
                                                  control={form.control}
                                                  name="jumlah"
                                                  render={({ field }) => (
                                                    <FormItem>
                                                      <FormLabel>Jumlah (pax)</FormLabel>
                                                      <FormControl>
                                                        <Input type="number" placeholder="Contoh: 50" {...field} />
                                                      </FormControl>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                            </div>
                                        </div>
                                        
                                        <Separator/>
                                        
                                        {/* --- Section Administrasi --- */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="h-5 w-5 text-primary"/>
                                                <h3 className="text-lg font-semibold text-primary">Administrasi</h3>
                                            </div>
                                             <FormField
                                              control={form.control}
                                              name="pengaju"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Yang Mengajukan</FormLabel>
                                                  <FormControl>
                                                    <Input placeholder="Masukkan nama pengaju" {...field} />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                            <FormField
                                              control={form.control}
                                              name="approval"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Approval</FormLabel>
                                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                      <SelectTrigger><SelectValue placeholder="Pilih atasan untuk approval" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                      {approvalOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                                    </SelectContent>
                                                  </Select>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 sm:p-6">
                                        <Button asChild type="submit" className="w-full" size="lg">
                                            <motion.button whileHover={{scale: 1.02}} whileTap={{scale: 0.98}}>Review Pesanan</motion.button>
                                        </Button>
                                    </CardFooter>
                                </motion.form>
                            </Form>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="history"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="p-4 sm:p-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Cari berdasarkan nama acara..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <CardContent className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
                                {filteredHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredHistory.map((order, index) => (
                                            <motion.div 
                                                key={order.id} 
                                                className="p-4 border rounded-lg bg-background/50 dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow"
                                                initial={{opacity: 0, y: 20}}
                                                animate={{opacity: 1, y: 0}}
                                                transition={{delay: index * 0.05}}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-semibold">{order.keterangan}</h4>
                                                      <Badge 
                                                        variant={
                                                            order.status === 'Disetujui' ? 'success' :
                                                            order.status === 'Ditolak' ? 'destructive' :
                                                            'warning'
                                                        }
                                                      >
                                                        {order.status}
                                                      </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">Dipesan pada: {new Date(order.orderTimestamp).toLocaleString('id-ID')}</p>
                                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                    <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground"/> {new Date(order.tanggal).toLocaleDateString('id-ID')}</div>
                                                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground"/> {order.jumlah} pax</div>
                                                    <div className="flex items-center gap-2 col-span-2"><MapPin className="h-4 w-4 text-muted-foreground"/> {order.lokasi}</div>
                                                    <div className="flex items-center gap-2 col-span-2"><ShoppingBasket className="h-4 w-4 text-muted-foreground"/> {order.jenisKonsumsi}</div>
                                                    <div className="flex items-center gap-2 col-span-2"><User className="h-4 w-4 text-muted-foreground"/> Diajukan oleh: {order.pengaju}</div>
                                                    <div className="flex items-center gap-2 col-span-2"><ShieldCheck className="h-4 w-4 text-muted-foreground"/> Approval: {order.approval}</div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-muted-foreground">{searchTerm ? "Tidak ada pesanan yang cocok." : "Belum ada riwayat pemesanan."}</p>
                                    </div>
                                )}
                            </CardContent>
                             <CardFooter className="p-4 sm:p-6 flex flex-col-reverse sm:flex-row gap-2 justify-between">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button onClick={() => setViewMode('form')} className="w-full sm:w-auto" variant="outline">Kembali ke Form</Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Isi formulir pesanan baru</p></TooltipContent>
                                </Tooltip>
                                {riwayatPemesanan.length > 0 && (
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="destructive" className="w-full sm:w-auto">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Hapus Riwayat
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>Hapus semua data riwayat</p></TooltipContent>
                                            </Tooltip>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus semua data riwayat pemesanan Anda secara permanen.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleClearHistory}>Ya, Hapus</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </CardFooter>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Detail Pesanan</DialogTitle>
                        <DialogDescription>
                            Mohon periksa kembali detail pesanan Anda sebelum melakukan submit.
                        </DialogDescription>
                    </DialogHeader>
                    {currentOrderData && (
                        <div className="grid grid-cols-[120px,1fr] items-baseline gap-x-4 gap-y-3 py-4 text-sm">
                            {[
                                { label: "Tanggal", value: currentOrderData.tanggal.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) },
                                { label: "Waktu", value: <span className="capitalize">{currentOrderData.waktu}</span> },
                                { label: "Jenis & Jumlah", value: `${currentOrderData.jenisKonsumsi || 'Belum dipilih'} (${currentOrderData.jumlah || '0'} pax)` },
                                { label: "Acara", value: currentOrderData.keterangan === 'Lainnya' ? currentOrderData.keteranganLainnya : currentOrderData.keterangan || "-" },
                                { label: "Lokasi", value: currentOrderData.lokasi === 'Lainnya' ? currentOrderData.lokasiLainnya : currentOrderData.lokasi || "-" },
                                { label: "Yang Mengajukan", value: currentOrderData.pengaju || "-" },
                                { label: "Approval", value: currentOrderData.approval || "Belum dipilih" },
                            ].map(({ label, value }) => (
                                <React.Fragment key={label}>
                                    <span className="text-muted-foreground text-right font-medium">{label}</span>
                                    <div className="font-semibold">{value}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                    <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="w-full sm:w-auto">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Mengirim...' : 'Ya, Konfirmasi & Submit'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </TooltipProvider>
        </div>
    );
}

