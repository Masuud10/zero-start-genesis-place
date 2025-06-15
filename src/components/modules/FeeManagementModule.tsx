
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Progress } from '@/components/ui/progress';

const feeCollectionData = [
    { name: 'Grade 1', collected: 4000, expected: 5000 },
    { name: 'Grade 2', collected: 3000, expected: 4000 },
    { name: 'Grade 3', collected: 5000, expected: 5000 },
    { name: 'Grade 4', collected: 4500, expected: 6000 },
    { name: 'Grade 5', collected: 7000, expected: 8000 },
];

const paymentMethodsData = [
    { name: 'MPESA', value: 400 },
    { name: 'Bank Transfer', value: 300 },
    { name: 'Cash', value: 300 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const FeeManagementModule = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Fee Management & Analytics</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Collected (This Term)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">KES 23,500</p>
                        <p className="text-sm text-muted-foreground">out of KES 28,000</p>
                        <Progress value={(23500/28000)*100} className="mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Outstanding Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-orange-600">KES 4,500</p>
                        <p className="text-sm text-muted-foreground">from 12 students</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Collection Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-600">83.9%</p>
                        <p className="text-sm text-muted-foreground">Target: 90%</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Fee Collection by Grade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={feeCollectionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="collected" fill="#10b981" name="Collected (KES)" />
                                <Bar dataKey="expected" fill="#3b82f6" name="Expected (KES)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={paymentMethodsData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label>
                                    {paymentMethodsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default FeeManagementModule;
