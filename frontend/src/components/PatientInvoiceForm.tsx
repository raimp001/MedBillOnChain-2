'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle } from 'lucide-react'

interface MedicalService {
  id: number;
  service: string;
  icd10: string;
  cost: number;
}

export default function PatientInvoiceForm() {
  const [patientName, setPatientName] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [patientAddress, setPatientAddress] = useState('')
  const [services, setServices] = useState<MedicalService[]>([
    { id: 1, service: 'General Consultation', icd10: 'Z00.00', cost: 150 },
    { id: 2, service: 'Blood Test', icd10: 'Z01.7', cost: 75 },
  ])
  const [additionalNotes, setAdditionalNotes] = useState('')

  const addService = () => {
    const newService: MedicalService = {
      id: services.length + 1,
      service: '',
      icd10: '',
      cost: 0
    }
    setServices([...services, newService])
  }

  const updateService = (id: number, field: keyof MedicalService, value: string | number) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ))
  }

  const totalCost = services.reduce((sum, service) => sum + service.cost, 0)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-2xl">Patient Invoice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name</Label>
            <Input 
              id="patientName" 
              placeholder="Enter patient name" 
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patientEmail">Patient Email</Label>
            <Input 
              id="patientEmail" 
              type="email" 
              placeholder="Enter patient email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="patientAddress">Patient Address</Label>
          <Textarea 
            id="patientAddress" 
            placeholder="Enter patient address"
            value={patientAddress}
            onChange={(e) => setPatientAddress(e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Medical Services</h3>
            <Button onClick={addService} variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>ICD-10</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <Input 
                      value={service.service} 
                      onChange={(e) => updateService(service.id, 'service', e.target.value)}
                      placeholder="Enter service name"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={service.icd10} 
                      onChange={(e) => updateService(service.id, 'icd10', e.target.value)}
                      placeholder="Enter ICD-10 code"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      value={service.cost} 
                      onChange={(e) => updateService(service.id, 'cost', parseFloat(e.target.value))}
                      placeholder="Enter cost"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4">
            <p className="text-lg font-semibold">Total: ${totalCost.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional Notes</Label>
          <Textarea 
            id="additionalNotes" 
            placeholder="Enter any additional notes or instructions for the patient"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
          />
        </div>

        <Button className="w-full">Generate Invoice</Button>
      </CardContent>
    </Card>
  )
}